import { tr } from "date-fns/locale";
import { db } from "../prisma";
import { inngest } from "./client";
import { sendEmail } from "@/actions/send-email";
import Email from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";
export const CheckBudgetAlerts = inngest.createFunction(
  { id: "Check Budget Alerts" },
  { cron: "0 */6 * * * " }, //
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
                lte: endOfMonth,
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

          console.log(
            `Budget ${budget.id}: ${percentageUsed.toFixed(1)}% used`
          );

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
              }),
            });

            await db.budget.update({
              where: {
                id: budget.id,
              },
              data: {
                lastAlertAt: new Date(),
              },
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
function calculateNextReccurringDate(currentdate, interval) {
  const date = new Date(currentdate);
  switch (interval) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}

export const TriggerReccuringTransactions = inngest.createFunction(
  { id: "Reccuring Transactions" },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    const reccuringTransaction = await step.run(
      `fecth-recurring-transaction`,
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProccessedDate: null },
              { nextReccuringDate: { lte: new Date() } },
            ],
          },
        });
      }
    );

    if (reccuringTransaction.length > 0) {
      try {
        const processtrans = await step.run(
          `process recurring transaction`,
          async () => {
            await db.$transaction(async (tx) => {
              for (const transaction of reccuringTransaction) {
                const nextDate = new Date(transaction.nextReccuringDate);
                const currentDate = new Date();
                if (currentDate.toDateString() >= nextDate.toDateString()) {
                  await tx.transaction.create({
                    data: {
                      userId: transaction.userId,
                      accountId: transaction.accountId,
                      type: transaction.type,
                      amount: transaction.amount,
                      description: transaction.description,
                      date: currentDate,
                      category: transaction.category,
                      isRecurring: false,
                    },
                  });
                  await tx.transaction.update({
                    where: {
                      id: transaction.id,
                    },
                    data: {
                      lastProccessedDate: currentDate,
                      nextReccuringDate: calculateNextReccurringDate(
                        currentDate,
                        transaction.reccurringInterval
                      ),
                    },
                  });
                  const account = await tx.account.findUnique({
                    where: {
                      id: transaction.accountId,
                    },
                  });
                  const balanceChange =
                    transaction.type === "Expense"
                      ? -transaction.amount
                      : transaction.amount;
                  const newBalance = account.balance.toNumber() + balanceChange;
                  await tx.account.update({
                    where: {
                      id: transaction.accountId,
                    },
                    data: {
                      balance: newBalance,
                    },
                  });
                }
              }
            });
          }
        );
      } catch (err) {
        console.log("Error in add recurring transaction : ", err.message);
      }
    }
  }
);

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    const users = await step.run("fetch-user", async () => {
    return await db.user.findMany({
        include: { account: true },
      });
    });

    for(const user of users){
      await step.run(`generate-report-${user.id}`,async()=>{
        const lastMonth=new Date();
        lastMonth.setMonth(lastMonth.getMonth()-1);
        const stats= await getMonthlyStats(user.id,lastMonth);
        const monthName=lastMonth.toLocaleString("default",{
          month:"long",
        })
        const insights=await generateMonthlyInsights(stats,monthName);

        await sendEmail({
              to: user.email,
              subject: `Monthly Report for ${monthName}`,
              react: Email({
                username: user.name,
                type: "monthly-report",
                data: {
                  stats,
                  month:monthName,
                  insights
                },
              }),
            });
      })

    
    }

    return{processed:users.length};

  }
);
const generateMonthlyInsights=async(stats,month)=>{
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    
    const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;
   try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }

};
const getMonthlyStats = async(userId,month)=>{
  const startDate=new Date(month.getFullYear(),month.getMonth(),1);
  const lastDate=new Date(month.getFullYear(),month.getMonth()+1,0);
  
  const transactions=await db.transaction.findMany({
    where:{
      userId,
      date:{
        gte:startDate,
        lte:lastDate,
      }
    }

  });

  return transactions.reduce((stats,t)=>{
    
    if(t.type==='Expense'){
      stats.totalExpenses+=t.amount.toNumber();
      stats.byCategory[t.category]=( stats.byCategory[t.category] || 0 )+t.amount.toNumber();

    }else{
      stats.totalIncome+=t.amount.toNumber();
    }
    return stats;
  },{
    totalExpenses:0,
    totalIncome:0,
    byCategory:{},
    transactionCount:transactions.length
  }
  )
}

