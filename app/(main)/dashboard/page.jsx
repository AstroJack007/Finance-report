import React, { Suspense } from "react";
import { CreateAccountDrawer } from "@/components/create-account";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getUserAccounts } from "@/actions/dashboard";
import Accountcard from "./_components/account-card";
import { getCurrentBudget } from "@/actions/budget";
import BudgetProgress from "./_components/BudgetProgress";
import { getDashboardData } from "@/actions/dashboard";
async function DashboardPage() {
  const accounts = await getUserAccounts();

  const defaultAcc = accounts?.find((account) => account.isDefault);
  let budgetData = null;

  if (defaultAcc) {
    budgetData = await getCurrentBudget(defaultAcc.id);
  }

  const transaction= await getDashboardData();
  return (
    <div className="px-5 ">
      {/*Budget Progress*/}
      <div className="mb-3">
        {defaultAcc && (
          <BudgetProgress
            initialBudget={budgetData?.budget}
            currentExpenses={budgetData?.currentExpenses || 0}
          />
        )}
      </div>

      {/*account grid*/}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col justify-center items-center h-full text-muted-foreground ">
              <Plus className="h-10 w-10 mb-2 " />
              <p className="text-sm font-bold">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts?.map((account) => {
            return <Accountcard key={account.id} account={account} />;
          })}
      </div>

          <Suspense fallback={"Loading..."}> 
            <DashboardOverview
            accounts={accounts}
            transaction={transaction||0}/>
          </Suspense>

    </div>
  );
}

export default DashboardPage;
