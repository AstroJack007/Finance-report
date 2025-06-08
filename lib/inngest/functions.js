import { db } from "../prisma";
import { inngest } from "./client";

export const CheckBudgetAlerts = inngest.createFunction(
  { id: "Check Budget Alerts" },
  { cron: "0 */6 * * * " },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              account: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });
    for (const budget of budgets) {
      const Defaultacc = budget.user.account[0];
      if (!Defaultacc) continue;
      await step.run(`check-budget-${budget.id}`, async () => {
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
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: Defaultacc.id,
            type: "Expense",
            date: {
              gte: startOfMonth,
              lte: endofMonth
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExp = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.ammount;
        const percentageUsed = (totalExp / budgetAmount) * 100;


        const isNewMonth = (lastAlertSent, currentDate) => {
          return (
            lastAlertSent.getMonth() !== currentDate.getMonth() ||
            lastAlertSent.getFullYear() !== currentDate.getFullYear()
          );
        };
        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertAt ||
            isNewMonth(new Date(budget.lastAlertAt), new Date()))
        ) {

            //send email



            //update the lastalertsent

            await db.budget.update({
                where:{
                    id:budget.id,
                },
                data:{
                    lastAlertAt:new Date(),
                }
            })

        }
      });
    }
  }
);
