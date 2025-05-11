"use client";

import React, { useEffect, useMemo, useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ArrowBigLeft } from "lucide-react";
import { ArrowBigRight } from "lucide-react";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { categoryColors } from "@/data/categories";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search, Trash, X } from "lucide-react";
import { Input } from "@/components/ui/input";

import { type } from "os";
import useFetch from "@/hooks/use-fetch";
import { BulkDeleteTransactions } from "@/actions/accounts";
const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedeIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setsearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [pages, setpages] = useState(1);

  const handlePage = (selectedPage) => {
    if (
      selectedPage >= 1 &&
      selectedPage <= Math.ceil(filteredandSortedTransactions.length / 25) &&
      selectedPage !== pages
    )
      setpages(selectedPage);
  };
  const filteredandSortedTransactions = useMemo(() => {
    let result = [...transactions];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    if (recurringFilter) {
      if (recurringFilter == "recurring") {
        result = result.filter((transaction) => transaction.isRecurring);
      } else if (recurringFilter == "non-recurring") {
        result = result.filter(
          (transaction) => transaction.isRecurring === false
        );
      }
    }
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(BulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    ) {
      return;
    }

    deleteFn(selectedIds);
  };
  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.success("Transaction deleted succesfully");
      setSelectedeIds([]);
    }
  }, [deleted, deleteLoading]);
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

  const handleClearFilters = () => {
    setRecurringFilter("");
    setsearchTerm("");
    setSelectedeIds([]);
    setTypeFilter("");
  };
  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      {/*Filter*/}
      <div className="flex gap-2 ">
        <div className="relative flex-1 ">
          <Search className="absolute left-1 top-1.75 text-muted-foreground " />
          <Input
            className="pl-8"
            placeholder="Search Transactions... "
            onChange={(e) => setsearchTerm(e.target.value)}
            value={searchTerm}
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => setRecurringFilter(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only</SelectItem>
              <SelectItem value="non-recurring">Non-recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash className="h-4 w-4" /> Delete Selected (
                {selectedIds.length})
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button variant="outline" size="icon" onClick={handleClearFilters}>
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>
      {/*Transaction Table */}
      <div className="border-2 rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectedAll}
                  checked={
                    selectedIds.length ===
                      filteredandSortedTransactions?.length &&
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
            {filteredandSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground text-xl"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredandSortedTransactions
                ?.slice(pages * 25 - 25, pages * 25)
                .map((transaction) => (
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
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this transaction?"
                                )
                              ) {
                                deleteFn([transaction.id]);
                              }
                            }}
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

        {transactions.length > 0 && (
          <div className="cursor-pointer flex justify-center align-center border-1 ">
            <span onClick={() => handlePage(pages-1)}>
              <ArrowBigLeft className="w-10 h-10" />
            </span>

            {[
              ...Array(Math.ceil(filteredandSortedTransactions.length / 25)),
            ].map((_, i) => {
              return (
                <span
                  key={i}
                  className={`p-1 text-lg mx-4 ${
                    pages === i + 1 
                      ? "font-bold text-purple-700 underline" 
                      : "text-gray-700"
                  }`}
                  onClick={() => handlePage(i + 1)}
                >
                  {i + 1}
                </span>
              );
            })}
            <span onClick={() => handlePage(pages+1)}>
              <ArrowBigRight className="w-10 h-10" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
