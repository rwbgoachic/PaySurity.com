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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PiggyBank, 
  Plus, 
  ChevronRight, 
  Calendar, 
  Target, 
  MoreVertical,
  Edit,
  Trash,
  CheckCircle,
  PauseCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SavingsGoal {
  id?: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  category?: string | null;
  isCompleted?: boolean | null;
  createdAt?: Date | null;
  dueDate?: Date | null;
  description?: string | null;
  image?: string | null;
  autoContributeAmount?: string | null;
  autoContributeFrequency?: string | null;
  // Parent contribution fields for parent-child goals
  parentContribution?: string;
}

interface SavingsGoalsDisplayProps {
  goals: SavingsGoal[];
  onCreateGoal: () => void;
  onEditGoal: (goal: SavingsGoal) => void;
  onShowDetails: (goalId: string) => void;
  emptyStateMessage?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  toys: <span className="text-purple-500">🧸</span>,
  electronics: <span className="text-blue-500">📱</span>,
  sports: <span className="text-green-500">⚽</span>,
  games: <span className="text-red-500">🎮</span>,
  travel: <span className="text-yellow-500">✈️</span>,
  education: <span className="text-cyan-500">📚</span>,
  clothes: <span className="text-pink-500">👕</span>,
  other: <span className="text-gray-500">📦</span>,
};

export default function SavingsGoalsDisplay({
  goals,
  onCreateGoal,
  onEditGoal,
  onShowDetails,
  emptyStateMessage = "You don't have any savings goals yet. Create your first goal!"
}: SavingsGoalsDisplayProps) {
  const formatCurrency = (amount: string) => {
    const value = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date instanceof Date ? date : new Date(date));
  };
  
  const calculateProgress = (goal: SavingsGoal) => {
    const current = parseFloat(goal.currentAmount);
    const target = parseFloat(goal.targetAmount);
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  const getStatusBadge = (goal: SavingsGoal) => {
    if (goal.isCompleted) {
      return <Badge className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
    }
    
    const progress = calculateProgress(goal);
    
    if (progress === 100) {
      return <Badge className="bg-green-100 text-green-700 border-green-300">Ready to Claim</Badge>;
    } else if (progress >= 75) {
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Almost There</Badge>;
    } else if (progress >= 50) {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-300">Halfway</Badge>;
    } else if (progress >= 25) {
      return <Badge className="bg-amber-100 text-amber-700 border-amber-300">In Progress</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Just Started</Badge>;
    }
  };
  
  const getCategoryIcon = (category: string | null | undefined) => {
    if (!category) return categoryIcons.other;
    return categoryIcons[category] || categoryIcons.other;
  };
  
  const renderGoalCard = (goal: SavingsGoal) => {
    const progress = calculateProgress(goal);
    
    return (
      <Card 
        key={goal.id} 
        className={`relative overflow-hidden ${goal.isCompleted ? 'bg-green-50' : ''}`}
      >
        {goal.image && (
          <div className="absolute right-0 top-0 w-24 h-24 opacity-10">
            <img src={goal.image} alt="" className="object-cover w-full h-full" />
          </div>
        )}
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                {getCategoryIcon(goal.category)}
              </div>
              <CardTitle className="text-lg">{goal.name}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onShowDetails(goal.id || "")}>
                  <ChevronRight className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditGoal(goal)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Goal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {progress >= 100 && !goal.isCompleted && (
                  <DropdownMenuItem>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    Mark Complete
                  </DropdownMenuItem>
                )}
                {!goal.isCompleted && (
                  <DropdownMenuItem>
                    <PauseCircle className="mr-2 h-4 w-4 text-amber-600" />
                    Pause Goal
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(goal)}
            {goal.parentContribution && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Parent Contribution
              </Badge>
            )}
            {goal.autoContributeAmount && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Auto-Contribute
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pb-0">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex justify-between mt-4 mb-1">
            <div>
              <div className="text-xs text-muted-foreground">Saved</div>
              <div className="font-semibold">{formatCurrency(goal.currentAmount)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Goal</div>
              <div className="font-semibold">{formatCurrency(goal.targetAmount)}</div>
            </div>
          </div>
          
          {goal.dueDate && (
            <div className="mt-3 flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Target date: {formatDate(goal.dueDate)}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-4 pb-4">
          <Button 
            onClick={() => onShowDetails(goal.id || "")}
            variant="outline" 
            className="w-full"
          >
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <PiggyBank className="mr-2 h-5 w-5" /> 
          Savings Goals
        </h2>
        <Button onClick={onCreateGoal} size="sm">
          <Plus className="mr-1 h-4 w-4" /> New Goal
        </Button>
      </div>
      
      {goals.length === 0 ? (
        <Card className="border-dashed bg-muted/50">
          <CardContent className="py-8 flex flex-col items-center justify-center text-center">
            <PiggyBank className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl mb-2">No Goals Yet</CardTitle>
            <CardDescription className="max-w-md mb-6">
              {emptyStateMessage}
            </CardDescription>
            <Button onClick={onCreateGoal}>
              <Plus className="mr-1 h-4 w-4" /> Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => renderGoalCard(goal))}
          
          <Card className="border-dashed bg-muted/25 flex flex-col items-center justify-center text-center">
            <CardContent className="py-8">
              <Target className="h-10 w-10 text-muted-foreground mb-3" />
              <CardTitle className="text-lg mb-2">Add Another Goal</CardTitle>
              <CardDescription className="mb-4">
                Keep saving for the things you want!
              </CardDescription>
              <Button onClick={onCreateGoal} variant="outline">
                <Plus className="mr-1 h-4 w-4" /> New Goal
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}