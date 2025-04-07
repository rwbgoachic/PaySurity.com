import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PiggyBank,
  Plus,
  Landmark,
  DollarSign,
  ChevronRight,
  Trophy,
  Target,
  Award,
  ShoppingBag,
  Gamepad2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  dueDate?: string;
  category: string;
  parentContribution: number; // percentage of parent matching
  isCompleted: boolean;
}

interface SavingsGoalsDisplayProps {
  savingsGoals: SavingsGoal[];
  onAddGoal?: () => void;
  onContribute: (goalId: string) => void;
  onViewDetails: (goalId: string) => void;
  isChild?: boolean;
  isParent?: boolean;
}

export default function SavingsGoalsDisplay({
  savingsGoals,
  onAddGoal,
  onContribute,
  onViewDetails,
  isChild = false,
  isParent = false,
}: SavingsGoalsDisplayProps) {
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "education":
        return <Award className="h-5 w-5" />;
      case "toys":
        return <Target className="h-5 w-5" />;
      case "games":
        return <Gamepad2 className="h-5 w-5" />;
      case "clothing":
        return <ShoppingBag className="h-5 w-5" />;
      default:
        return <PiggyBank className="h-5 w-5" />;
    }
  };
  
  const calculateProgress = (current: string, target: string) => {
    const currentAmount = parseFloat(current);
    const targetAmount = parseFloat(target);
    if (isNaN(currentAmount) || isNaN(targetAmount) || targetAmount === 0) {
      return 0;
    }
    return Math.min(100, (currentAmount / targetAmount) * 100);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        {onAddGoal && (
          <Button onClick={onAddGoal} className="gap-1">
            <Plus className="h-4 w-4" /> Add Goal
          </Button>
        )}
      </div>
      
      {savingsGoals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 flex flex-col items-center justify-center text-center">
            <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Savings Goals Yet</h3>
            <p className="mb-4 text-muted-foreground max-w-md">
              {isChild 
                ? "Create a savings goal to start saving for things you want."
                : "Help your child create savings goals for things they want."}
            </p>
            {onAddGoal && (
              <Button onClick={onAddGoal} className="gap-1">
                <Plus className="h-4 w-4" /> Add Savings Goal
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savingsGoals.map((goal) => (
            <Card 
              key={goal.id} 
              className={`overflow-hidden ${goal.isCompleted ? "bg-muted/30" : ""}`}
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                  </div>
                  {goal.isCompleted && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                      Completed
                    </Badge>
                  )}
                </div>
                {goal.parentContribution > 0 && (
                  <CardDescription className="mt-1 flex items-center">
                    <Landmark className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    {goal.parentContribution}% parent match
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className="pb-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>${goal.currentAmount} saved</span>
                      <span>${goal.targetAmount} goal</span>
                    </div>
                    <Progress value={calculateProgress(goal.currentAmount, goal.targetAmount)} className="h-2" />
                  </div>
                  
                  {goal.dueDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Target date: </span>
                      <span>{goal.dueDate}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {!goal.isCompleted && (
                  <Button 
                    size="sm" 
                    onClick={() => onContribute(goal.id)}
                    disabled={goal.isCompleted}
                  >
                    <DollarSign className="h-4 w-4 mr-1" /> Contribute
                  </Button>
                )}
                
                {goal.isCompleted && (
                  <Button size="sm" variant="outline" className="gap-1">
                    <Trophy className="h-4 w-4" /> Goal Reached!
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary"
                  onClick={() => onViewDetails(goal.id)}
                >
                  Details <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}