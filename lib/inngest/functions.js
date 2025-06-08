import { db } from "../prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import Email from "@/emails/template";

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
      const defaultAcc = budget.user.account[0]; 
      if (!defaultAcc) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        try { 
          const currentDate = new Date();
          const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );
          const endOfMonth = new Date( 
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          );

          const expenses = await db.transaction.aggregate({
            where: {
              userId: budget.userId,
              accountId: defaultAcc.id,
              type: "Expense",
              date: {
                gte: startOfMonth,
                lte: endOfMonth
              },
            },
            _sum: {
              amount: true,
            },
          });

          const totalExp = expenses._sum.amount?.toNumber() || 0;
          const budgetAmount = parseFloat(budget.ammount); 
          const percentageUsed = (totalExp / budgetAmount) * 100;
          const remainingBudget = budgetAmount - totalExp;

          console.log(`Budget ${budget.id}: ${percentageUsed.toFixed(1)}% used`);

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
            console.log(`Sending alert for budget ${budget.id}`);
            
            // Send email
            await sendEmail({
              to: budget.user.email,
              subject: `Budget Alert for ${defaultAcc.name}`, 
              react: Email({
                username: budget.user.name,
                type: "budget-alert",
                data: {
                  percentageUsed: percentageUsed,
                  budgetAmount: budgetAmount, 
                  totalExpenses: totalExp.toFixed(2),
                  remainingBudget: remainingBudget.toFixed(2), 
                },
              })
            });

          
            await db.budget.update({
              where: {
                id: budget.id,
              },
              data: {
                lastAlertAt: new Date(),
              }
            });

            console.log(`Alert sent and updated for budget ${budget.id}`);
          }
        } catch (error) {
          console.error(`Error in budget check ${budget.id}:`, error);
          
        }
      });
    }

    return { processed: budgets.length };
  }
);