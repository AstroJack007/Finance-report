"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
     
      date.setMonth(date.getMonth()+1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
    
    return new Date(date);
}

const serializeTransaction = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
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

export async function scanReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const arrayBuffer = await file.arrayBuffer(); //conver file to array buffer
    const base64String = Buffer.from(arrayBuffer).toString("base64"); //convert array buffer to base64 string

    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
      inlineData: {
        mimeType: file.type,
        data: base64String,
      },
    },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```(?:json)?\n?/g, "").trim();

    try{
        const data = JSON.parse(cleanText);
        return {
          amount:parseFloat(data.amount),
          date:new Date(data.date),
          description:data.description,
          category:data.category,
        };

    }catch(parseError){
      console.log("Error parsing JSON response:", parseError);
      throw new Error("Failed to parse receipt data");
    }
    
  } catch (err) {
    console.error("Error scanning receipt:", err.message);
    throw new Error("Failed to scan receipt");
  }
}
