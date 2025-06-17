"use client";
import { scanReceipt } from "@/actions/transaction";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react"
import { Camera } from 'lucide-react';
const ReceiptScanner = ({onScanComplete}) => {
  const handleFileSubmit = useRef();

  const {
    data: scannedData,
    loading: scanLoading,
    error,
    fn: scanReceiptFn,
  } = useFetch(scanReceipt);
  const handleScanReceipt = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Too big file size. Please upload a file smaller than 5MB.");
      return;
    }
    scanReceiptFn(file);
  };
  useEffect(()=>{
    if(scannedData&& !scanLoading){
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
  }
},[scannedData,scanLoading])
  return (
    <div>
      <input
        type="file"
        ref={handleFileSubmit}
        accept="image"
        className="hidden"
      
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleScanReceipt(file);
        }}
      />
      {!scanLoading ? (
        <Button type="button" className="w-full mb-4" onClick={()=>handleFileSubmit.current?.click()}><Camera />Scan Receipt with AI</Button>
      ) : (
        <Button type="button" className="w-full mb-4" disabled>
          <Loader2Icon className="animate-spin" />
          Please wait
        </Button>
      )}
    </div>
  );
};

export default ReceiptScanner;
