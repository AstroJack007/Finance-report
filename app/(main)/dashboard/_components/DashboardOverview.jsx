"use client";
import React, { useState } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import format from "date-fns/format";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];
const DashboardOverview = ({ accounts, transactions }) => {
  const [selectedAccounId, setSelectedAccounId] = useState(
    accounts.find((ac) => ac.isDefault)?.id || accounts[0].id
  );

  const filterTransaction = transactions.filter(
    (t) => t.accountId === selectedAccounId
  );
  const recentTransaction = filterTransaction
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  //calculate expense breakdown for current month
  const currentDate = new Date();
  const currentMonthExpenses = filterTransaction.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "Expense" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const expensescategory = currentMonthExpenses.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) acc[category] = 0;
    acc[category] += transaction.amount;
    return acc;
  }, {});
  const piechartdata = Object.entries(expensescategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>

          <Select value={selectedAccounId} onValueChange={setSelectedAccounId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransaction.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No Recent Transaction Found{" "}
              </p>
            ) : (
              recentTransaction.map((t) => {
                return (
                  <div key={t.id} className="flex justify-between">
                    <div>
                      <p className="font-bold">
                        {t.description || "Untitled Transaction"}
                      </p>
                      <p className="text-muted-foreground">
                        {format(new Date(t.date), "PP")}
                      </p>
                    </div>
                    <div>
                      <p>
                        {t.type === "Expense" ? (
                          <p className="flex text-red-700">
                            <ArrowDownRight />₹{t.amount}
                          </p>
                        ) : (
                          <p className="flex text-green-700">
                            <ArrowUpRight />₹{t.amount}
                          </p>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          
          {piechartdata.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No Expenses for this month
            </p>
          ) : (
            <PieChart width={730} height={250}>
              <Pie
                data={piechartdata}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ₹${value.toFixed(2)}`}
              >
                {piechartdata.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Legend
            
                height={36}
                wrapperStyle={{ paddingTop: "30px" }}
              />
            </PieChart>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
