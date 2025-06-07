"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {updateCurrentBudget} from "@/actions/budget"
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { Progress } from "@/components/ui/progress";
const BudgetProgress = ({ initialBudget, currentExpenses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(initialBudget);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.ammount?.toString() || "" // Fixed: use ammount
  );
   
  const {
    loading: updateBudgetLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateCurrentBudget);
  
  const percentUsed = currentBudget
    ? (currentExpenses / currentBudget.ammount) * 100
    : 0;
    
  const handleUpdateBudget = async() => {
    const amount = parseFloat(newBudget);
   
    if(isNaN(amount) || amount <= 0){
      toast.error("Please Enter a valid amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  useEffect(() => {
    if(updatedBudget?.success){ 
      toast.success("Budget updated successfully");
      
      setCurrentBudget({
        ...currentBudget,
        ammount: parseFloat(newBudget)
      });
      setIsEditing(false); 
    }
  }, [updatedBudget]);

  useEffect(() => {
    if(error){
      toast.error(error.message || "Failed to update Budget");
    }
  }, [error]);

  const handleCancel = () => {
    setNewBudget(currentBudget?.ammount?.toString() || ""); 
    setIsEditing(false);
  };
  
  return (
    <Card>
      <CardHeader className="flex space-y-0 justify-between items-center pb-2">
        <div className="flex-1">
          <CardTitle>Monthly Budget (Default Account)</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter Amount"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleUpdateBudget}
                  disabled={updateBudgetLoading}
                >
                  <Check className="h-4 w-4 text-green-400" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {currentBudget
                    ? `$${currentExpenses.toFixed(2)} of $${currentBudget.ammount.toFixed(2)} spent`
                    : "No Budget set"}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6"
                >
                  <Pencil className="h-4 w-4"/>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
       {initialBudget && (
        <div>
          <Progress value={percentUsed}/>
        </div>
       )}
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;