import React,{ Suspense } from "react";
import { getAccountwithTransactions } from "@/actions/accounts";
import { notFound } from "next/navigation";
import transactiontable from "../components/transaction-table";

const page = async ({ params }) => {
  const accountdata = await getAccountwithTransactions(params.id);
  if (!accountdata) {
    notFound();
  }

  const { transactions, ...account } = accountdata;
  
  return (
    <div className="flex items-center justify-between"> 
      <div>
      <h1 className="gradient-title capitalize text-5xl font-bold">{account.name}</h1>
      <p className="text-muted-foreground ">
        {account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account
      </p>
      </div>


      <div>
        <div className="text-2xl font-bold text-right">${parseFloat(account.balance).toFixed(2)}</div>
        <p className="text-muted-foreground ">{account._count.transactions} Transactions</p>
      </div>

      {/*CHART SECTION */}

      {/*TABLE SECTION */}
      <Suspense>
        <transactiontable/>
      </Suspense>
    </div>
  );
};

export default page;
