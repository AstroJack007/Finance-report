"use client";
import React from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "@/components/ui/drawer"
  
export const CreateAccountDrawer = ({children}) => {
    const [open,setopen]=useState(false);
    function onClick(){
        setopen(!open);
    }
  return (
    <Drawer open={open} >
    <DrawerTrigger onClick={setOpen}>{children}</DrawerTrigger>
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>Are you absolutely sure?</DrawerTitle>
      
      </DrawerHeader>
    
    </DrawerContent>
  </Drawer>
  
  )
}
