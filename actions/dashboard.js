"use server"
import {auth} from "@clerk/nextjs/server"
import {db} from "@/lib/prisma"
import { ToastContainer, toast } from 'react-toastify';
const serializeTransaction =(obj)=>{
    const serialized ={...obj};

    if(obj.balance){
        serialized.balance=obj.balance.toNumber();
    }
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
        toast.error(err.message);
    }
}