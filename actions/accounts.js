"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized ");
    }
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not Found");

    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: {
        isDefault: true,
      },
    });
    revalidatePath("/dashboard");
    return { success: true, data: serializeTransaction(account) };
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getAccountwithTransactions(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized ");
    }
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) throw new Error("User not Found");

    const account = await db.account.findUnique({
      where: {
        userId: user.id,
        id: accountId,
      },
      include: {
        transactions: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!account) return null;
    return {
      ...serializeTransaction(account),
      transactions: account.transactions.map(serializeTransaction),
    };
  } catch (err) {
    throw new Error(err);
  }
}

export async function BulkDeleteTransactions(transactionIds) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("user not found");
    }
    

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    if (!transactions.length) {
      throw new Error("No valid transactions found to delete");
    }

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const amount =
        typeof transaction.amount === "string"
          ? parseFloat(transaction.amount)
          : transaction.amount.toNumber
          ? transaction.amount.toNumber()
          : Number(transaction.amount);

      const change = transaction.type === "Expense" ? amount : -amount;

      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      });

      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");
    return { success: true };
  } catch (err) {
    throw new Error(err.message);
  }
}
