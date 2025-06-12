import { ReccurringInterval } from "@prisma/client";
import {z} from "zod";

export const accountSchema = z.object({
    name: z.string().min(1,"Name is required"),
    type:z.enum(["CURRENT","SAVINGS"]),
    balance: z.string().min(1,'Initial Balance is required'),
    isDefault:z.boolean().default(false),
})

export const TransactionSchema = z.object({
 type:z.enum(["Expense","Income"]),
 amount : z.string().min(1,"Amount is required"),
 description:z.string().optional(),
 date:z.date({required_error:"Date is required"}).default(new Date()),  
 accountId:z.string().min(1,"Account is required"),
 category:z.string().min(1,"Category is required"),
 isRecurring:z.boolean().default(false),
 reccurringInterval:z.enum(["daily","weekly","monthly","yearly"]).optional(),

}).superRefine((data,ctx)=>{
    if(data.isRecurring && !data.reccurringInterval){
        ctx.addIssue({
            code:z.ZodIssueCode.custom,
            message:"Reccurring Interval is required when transaction is reccuring",
            path:["reccurringInterval"],
        })
    }
})