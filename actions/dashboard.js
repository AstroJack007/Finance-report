"use server"
import {auth} from "@clerk/nextjs/server"
import {db} from "@/lib/prisma"
import { toast, Toaster } from "sonner";
import {revalidatePath} from "next/cache";
import { serialize, writeHeapSnapshot } from "v8";

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


export async function createAccount(data){
    try{
        const {userId}=await auth();
        if(!userId){
            throw new Error("User not authenticated")

        }
        const user = await db.user.findUnique({
            where: {clerkUserId:userId},
        })
        if(!user){
            throw new Error("User not found");
        }
        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)){
            throw new Error("Invalid balance value");
        }

        const existingAccount = await db.account.findMany({
            where:{
                userId:user.id, 
            }
        })

        const shouldBeDefault =existingAccount.length === 0?true:data.isDefault;

        if(shouldBeDefault){
            await db.account.updateMany({
                where:{
                    userId:user.id,isDefault:true,
                },
                data:{
                    isDefault:false,
                }
            })
        }

        const account = await db.account.create({
            data:{
                ...data,
                balance:balanceFloat,
                userId:user.id,
                isDefault:shouldBeDefault,
            }
        });

        const serializedAccount =serializeTransaction(account);
        
        revalidatePath("/dashboard");
        return {success : true , data :serializedAccount};
    }catch(err){
        throw new Error(err.message);
    }
}

export async function getUserAccounts(){
    
        const {userId}=await auth();
        if(!userId){
            throw new Error("Unauthorized");

        }

        const user=await db.user.findUnique({
            where:{clerkUserId:userId},
        })
        if(!user){
            throw new Error("User not found");
        }
        
        const accounts = await db.account.findMany({
            where:{
                userId: user.id,
            },
            orderBy:{
                createdAt:"desc",
            },
            include:{
                _count:{
                    select:{
                        transactions:true,
                    }
                }
            }

           

        })
        const serializedAccount= accounts.map(serializeTransaction);
        return serializedAccount;
        


}

export async function getDashboardData(){
    try{
    const {userId}=await auth();
    if(!userId){
        throw new Error("Unauthorized");
    }

    const user=await db.user.findUnique({
        where:{
            clerkUserId:userId,
        }
    })
    if(!userId){
        throw new Error("User not found")
    }
    const transactions= await db.transaction.findMany({
        where:{
            userId:user.id,

        },
        orderBy:{
            date:"desc"
        }
    })
    return transactions.map(serializeTransaction);
}catch(err){
    throw new Error(err.message);
}
}