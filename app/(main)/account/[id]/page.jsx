import React, { Suspense } from "react";
import { getAccountwithTransactions } from "@/actions/accounts";
import { notFound } from "next/navigation";
import TransactionTable from "../components/transaction-table";
import { BarLoader } from "react-spinners";

const page = async ({ params }) => {
  const { id } = params;
  const accountdata = await getAccountwithTransactions(id);
  if (!accountdata) {
    notFound();
  }

  const { transactions, ...account } = accountdata;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="gradient-title capitalize text-5xl font-bold">
            {account.name}
          </h1>
          <p className="text-muted-foreground ">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div>
          <div className="text-2xl font-bold text-right">
          &#8377;{parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-muted-foreground ">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/*CHART SECTION*/}

      <div className="">
        <Suspense
          fallback={
            <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
          }
        >
          <TransactionTable transactions={transactions} />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
