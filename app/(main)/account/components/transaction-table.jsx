"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { categoryColors } from "@/data/categories";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedeIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const filteredandSortedTransactions = transactions;
  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field == field && current.direction === "asc" ? "desc" : "asc",
    }));
  };
  console.log(selectedIds);
  const handleSelected = (id) => {
    setSelectedeIds((current) =>
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id]
    );
  };
  const handleSelectedAll = () => {
    setSelectedeIds((current) =>
      current.length === filteredandSortedTransactions.length
        ? []
        : filteredandSortedTransactions.map((t) => t.id)
    );
  };
  return (
    <div className="space-y-4">
      <div className="border-2 rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectedAll}
                  checked={
                    selectedIds.length ===
                      filteredandSortedTransactions.length &&
                    filteredandSortedTransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date{" "}
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1 mt-1" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category{" "}
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1 mt-1" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount{" "}
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4 ml-1 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 ml-1 mt-1" />
                    ))}
                </div>
              </TableHead>

              <TableHead>Reccuring</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredandSortedTransactions === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground text-xl"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredandSortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      onCheckedChange={() => handleSelected(transaction.id)}
                      checked={selectedIds.includes(transaction.id)}
                    />
                  </TableCell>

                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="capitalize ">
                    <span
                      style={{
                        background: categoryColors[transaction.category],
                      }}
                      className="rounded px-2 py-1"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-right font-medium"
                    style={{
                      color: transaction.type === "Expense" ? "red" : "green",
                    }}
                  >
                    {transaction.type === "Expense" ? "-" : "+"}
                    &#8377;
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="capitalize">
                            <Badge
                              variant="outline"
                              className="gap-1 bg-purple-100 text-purple-800"
                            >
                              <Clock />
                              {transaction.reccurringInterval}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div>
                              <div className="font-medium">Next Date:</div>
                              <div>
                                {format(
                                  new Date(transaction.nextReccuringDate),
                                  "PP"
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline">
                        <Clock />
                        One-time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                        >
                          Edit
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel
                          className="text-destructive"
                          //onClick={() => deleteFn(transaction.id)}
                        >
                          Delete
                        </DropdownMenuLabel>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
