
import {getUserAccounts} from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import TransactionForm from "../components/TransactionForm";
import React from "react";

const AddTransactionPage = async () => {
    const accounts=await getUserAccounts();
    

    return (
        <div className="max-w-3xl mx-auto px-5">
            <h1 className=" text-5xl gradient-title mb-8">Add Transaction</h1>
            <TransactionForm accounts={accounts} categories={defaultCategories}/>
        </div>

    );


};
export default AddTransactionPage;