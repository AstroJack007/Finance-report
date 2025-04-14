"use client"
import React from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { ArrowUpRight,ArrowDownRight } from 'lucide-react';
import {Switch} from "@/components/ui/switch";
import Link from 'next/link';
const Accountcard = ({account}) => {
    const {name,type,balance,isDefault, id }=account;


  return (
    <Card className="hover:shadow-md transition-shadow group relative  ">
        <Link href={`/account/${id}`} >
        
    <CardHeader className="flex justify-between items-start">
      <CardTitle className="text-xl font-medium ">{name}</CardTitle>
      <Switch checked={isDefault}
      onClick={(e) => e.stopPropagation()} />

    </CardHeader>
    <CardContent>
      <div className='text-xl font-bold'>
            ${parseFloat(balance).toFixed(2)}
      </div>
      <div className='text-s capitalize text-muted-foreground '>
            {type.slice(0).toLowerCase()} Account
      </div>
    </CardContent>
    <CardFooter className="flex justify-between items-start">
      <div className='flex items-center font-bold'>
      <ArrowUpRight className='text-green-500 mr-1'/> Income
      </div>
      <div className='flex items-center font-bold'>
      <ArrowDownRight className='text-red-500 m-1'/> Expense
      </div>
    </CardFooter>
    </Link>
  </Card>
  
  )
}

export default Accountcard;