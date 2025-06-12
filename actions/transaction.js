"use server"
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function calculateNextReccurringDate(currentdate, interval) {
  const date = new Date(currentdate);
  switch (interval) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setDate(date.getMonth() + 1);
      break;
    case "yearly":
      date.setDate(date.getFullYear() + 1);
      break;
  }
  return date;
}

const serializeTransaction = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});
export async function createTransaction(data) {
  try {
    const {userId} = await auth();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const account = await db.account.findUnique({
      where: {
        userId: user.id,
        id: data.accountId,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }
    
    const balanceChange = data.type === "Expense" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    if (newBalance < 0) {
      throw new Error("Insufficient balance");
    }

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          
          nextReccuringDate: data.isRecurring
            ? calculateNextReccurringDate(data.date, data.reccurringInterval)
            : null,
        },
      });

      await tx.account.update({
        where: {
          id: data.accountId,
        },
        data: {
          balance: newBalance,
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);
    return {
      success: true,
      data: serializeTransaction(transaction), //serializing the transaction for sending to client
    };
  } catch (err) {
    throw new Error(err.message || "Failed to create transaction");
  }
}
