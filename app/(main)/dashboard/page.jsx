import React from 'react'
import {CreateAccountDrawer}  from '@/components/create-account'
import{ Card,  CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react';
import { getUserAccounts} from "@/actions/dashboard";
import  Accountcard from "./_components/account-card";


async function DashboardPage  () { 
  const accounts= await getUserAccounts();
  return (
    <div className='px-5'>
        {/*Budget Progress*/}


        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
         
          <CreateAccountDrawer>
            <Card className='hover:shadow-lg transition-shadow cursor-pointer border-dashed'>
              <CardContent className="flex flex-col justify-center items-center h-full text-muted-foreground ">
                <Plus className="h-10 w-10 mb-2 "/>
                <p className='text-sm font-bold'>Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>
          

          {accounts.length>0 && accounts?.map((account)=>{
            return <Accountcard key ={account.id} account={account} />
          })}
          </div>          
    </div>
  )
}

export default DashboardPage;                    