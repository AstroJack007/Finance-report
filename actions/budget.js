"use server"
import {auth} from "@clerk/nextjs/server"
import { db } from "@/lib/prisma" 
import { revalidatePath } from "next/cache";
export async function getCurrentBudget(accountId) {
    try{
        const {userId}=await auth();
        if(!userId) throw new Error("unauthorized");
        const user=await db.user.findUnique({
            where:{clerkUserId:userId},
        })

        if(!user){
            throw new Error("User not found")
        }

        const budget= await db.budget.findFirst({
            where:{
                userId:user.id,
            },
        })

        const currentDate = new Date();
        const startOfMonth =new Date(    //new Date(year, monthIndex + 1, 0)

            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
        );
        const endofMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth()+1,
            0
        );

        const expenses =await db.transaction.aggregate({
            where:{
                userId:user.id,
                type:"Expense",
                date:{
                    gte:startOfMonth,
                    lte:endofMonth,
                },
                accountId,
            },
            _sum:{
                amount:true,
            }
            
        })
       return{
    budget: budget ? {
        id: budget.id,
        userId: budget.userId,
        lastAlertAt: budget.lastAlertAt,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
        ammount: budget.ammount.toNumber() 
    } : null,
    currentExpenses : expenses._sum.amount? expenses._sum.amount.toNumber():0,
};
        
    }catch(err){
        console.error("Error in getCurrentBudget:", err); 
        throw err; 
    }
}

export async function updateCurrentBudget( amount){
    try{
        
        const {userId}=await auth();
        if(!userId) throw new Error("unauthorized");
        const user=await db.user.findUnique({
            where:{clerkUserId:userId},
        })

        if(!user){
            throw new Error("User not found")
        }

        const budget=await db.budget.upsert({
            where:{
                userId:user.id,

            },
            update:{
               ammount: amount,
            },
            create:{
                userId:user.id,
                ammount: amount,
            },

        });

        revalidatePath("/dashboard");
        return{
            success:true,
            data: {
                id: budget.id,
                userId: budget.userId,
                lastAlertAt: budget.lastAlertAt,
                createdAt: budget.createdAt,
                updatedAt: budget.updatedAt,
                ammount: budget.ammount.toNumber() 
            },
        }

    }catch(err){
        console.error("Error in updateCurrentBudget:", err); 
        throw err; 
    }
}