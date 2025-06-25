import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import TransactionForm from "../components/TransactionForm";
import { getTransaction } from "@/actions/transaction";
import React from "react";

const AddTransactionPage = async ({ searchParams }) => {
  
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams?.edit;
  
  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }
  const accounts = await getUserAccounts();
  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className=" text-5xl gradient-title mb-8">{editId?"Edit Transaction" : "Add Transaction"}</h1>
      <TransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId} //!! means that first ! convert it into boolean and next ! return ture or false such that if it has any value it will return true else false
        initialData={initialData}
      />
    </div>
  );
};
export default AddTransactionPage;
