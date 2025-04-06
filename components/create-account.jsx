"use client";
import React from "react";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/app/lib/schema";
import { Switch } from "@/components/ui/switch";
import {Button } from '@/components/ui/button';
export const CreateAccountDrawer = ({ children }) => {
  const [open, setopen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const onSubmit =async(data)=>{
    console.log(data)
  }
  return (
    <Drawer open={open} onOpenChange={setopen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-lg">
            Are you absolutely sure?
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 py-3">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-md font-medium">
                Account Name:
              </label>
              <Input
                className="mt-3"
                id="name"
                placeholder="Enter name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message} </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-md font-medium">
                Account Type:
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type" className="mt-3">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>

              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message} </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="balance" className="text-md font-medium">
                Balance:
              </label>
              <Input
                className="mt-3"
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm text-red-500">
                  {errors.balance.message}{" "}
                </p>
              )}
            </div>

            <div className="flex items-center  justify-between border p-2 rounded-xl">
              <div className="">
              <label htmlFor="default" className="text-md font-medium">
                Set as Default:
              </label>
              <p className="font-medium">This account will be selected by default for transaction</p>
              
              </div>
              <Switch
                id="default"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />
              
              
            </div>

            <div className="flex gap-4 pt-4">
                <DrawerClose asChild>
                  <Button type='button' variant='outline' className="flex-1">
                    Cancel
                  </Button>
                </DrawerClose>

                <Button className='flex-1' >
                  Create Account
                </Button>
              </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
