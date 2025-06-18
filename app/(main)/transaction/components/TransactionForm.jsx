"use client";
import { TransactionSchema } from "@/app/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import useFetch from "@/hooks/use-fetch";
import { createTransaction } from "@/actions/transaction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar1, Receipt } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format, set } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parse } from "path";
import ReceiptScanner from "./ReceiptScanner";
const TransactionForm = ({ accounts, categories }) => {
  const router= useRouter(); // use router to navigate back after transaction creation
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      type: "Expense",
      amount: "",
      description: "",
      date: new Date(),
      isRecurring: false,
      accountId: accounts.find((ac) => ac.isDefault)?.id,
    },
  });

  const {
    data: transactionResult,
    loading: transactionLoading,
    error: errorfn,
    fn: transactionFn,
  } = useFetch(createTransaction);
  const type = watch("type"); //use where there are default values
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const category = watch("category");
  const handleScan=(data)=>{
    console.log("Scanned Data:", data);
    setValue("amount", data.amount);
    if(data.description){
    setValue("description", data.description);
    }
    if(data.category){
      setValue("category", data.category);
    }
    setValue("date", new Date(data.date));
    toast.success("Receipt scanned successfully");

    
  }
  const filteredCategories = categories.filter((cat) => {
    return cat.type === type;
  });

  const submit = async(data)=>{
    const formdata={
      ...data,
      amount: parseFloat(data.amount),
    }
    transactionFn(formdata)
  }
  useEffect(()=>{
    if(transactionResult?.success&& !transactionLoading){
     
      toast.success("Transaction created successfully");
       reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  },[transactionResult,transactionLoading]);
  useEffect(() => {
  if (errorfn) {
    toast.error("Failed to create transaction");
  }
}, [errorfn]);
  return (
    <form onSubmit={handleSubmit(submit)}>
      {/*AI RECEIPT SCANNER*/}
      <ReceiptScanner onScanComplete={handleScan} />





      <div className="space-y-4">
        <label className="font-bold">Type</label>
        <Select
          onValueChange={(value) => {
            setValue("type", value);
          }}
          defaultValue={type}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Expenes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Expense">Expense</SelectItem>
            <SelectItem value="Income">Income</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-red-500">{errors.type.message}</p>}
        {/*////////////////////////////////////////////////////////////////////////////*/}
        <div className="grid gap-6 md:grid-cols-2 mt-2">
          <div>
            <label className="font-bold">Amount</label>
            <Input
              type="number"
              
              step="0.01"
              placeholder="0.00"
              {...register("amount")} //spreading in order to enable validation and state management
              className="w-full mt-2" // register is used for input whereas setValue is used for select
            />
            {errors.amount && (
              <p className="text-red-500">{errors.amount.message}</p>
            )}
          </div>
          {/*////////////////////////////////////////////////////////////////////////////*/}
          <div>
            <label className="font-bold">Account</label>
            <Select
              onValueChange={(val) => {
                setValue("accountId", val);
              }}
              defaultValue={getValues("accountId")}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Select Account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}&nbsp;${parseFloat(acc.balance).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account && (
              <p className="text-red-500">{errors.account.message}</p>
            )}
          </div>
        </div>
        {/*////////////////////////////////////////////////////////////////////////////*/}
        <div>
          <label className="font-bold">Category</label>
          <Select
            onValueChange={(value) => {
              setValue("category", value);
            }}
            value={category|| ""}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {filteredCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-red-500">{errors.category.message}</p>
          )}
        </div>
        {/*////////////////////////////////////////////////////////////////////////////*/}
        <div>
          <div className="flex flex-col gap-3">
            <label className="font-bold">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  {date ? format(date, "PPP") : "Select date"}

                  <Calendar1 />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => {
                    setValue("date", date);
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
            <p className="text-red-500">{errors.date.message}</p>
          )}
          </div>
        </div>
        {/*////////////////////////////////////////////////////////////////////////////*/}

        <div >
          <label className="font-bold ">Description</label>
          <Input
            placeholder="Enter Description"
            className="w-full mt-3"
            {...register("description")}
          ></Input>
          {errors.description && (
            <p className="text-red-500">{errors.description.message}</p>
          )}
        </div>
          {/*////////////////////////////////////////////////////////////////////////////*/}
          <div>
            
            <div className="flex items-center  justify-between border p-2 rounded-xl">
              <div className="">
                <label htmlFor="default" className="text-md font-medium">
                  Recurring Transaction:
                </label>
                <p className="text-sm text-muted-foreground">
                  Set up a reccuring schedule for this transaction
                </p>
              </div>
              <Switch
                
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
                checked={isRecurring}
              />
            </div>
          </div>
        {isRecurring && (<div>
          <label className="font-semibold">ReccurringInterval</label>
          <Select
            onValueChange={(value) => {
              setValue("reccurringInterval", value);
            }}
            defaultValue={getValues("reccurringInterval") || ""}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Select Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.reccurringInterval && (
            <p className="text-red-500">{errors.reccurringInterval.message}</p>
          )}
        </div>

        )}


        {/*////////////////////////////////////////////////////////////////////////////*/}
        <div className="grid  gap-2 md:grid-cols-2">
          <Button type="button"
          variant="outline"
          className="w-full"
          onClick={()=> router.back()}>
            Cancel
          </Button>
          <Button
          type= "submit"
          className="w-full"
          disabled={transactionLoading}>
            Create Transaction
          </Button>
        </div>
     
      </div>
    </form>
  );
};

export default TransactionForm;
