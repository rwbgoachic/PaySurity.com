import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlusIcon } from "lucide-react";

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: string;
  currentAmount: string;
  percentComplete: number;
  parentMatching?: string;
  estimatedCompletion: string;
  onAddFunds: (id: string) => void;
  onViewDetails: (id: string) => void;
}

interface SavingsGoalsDisplayProps {
  goals: SavingsGoal[];
  onCreateNew: () => void;
}

export default function SavingsGoalsDisplay({ goals, onCreateNew }: SavingsGoalsDisplayProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Savings Goals</CardTitle>
          <CardDescription>Track your progress towards your goals</CardDescription>
        </div>
        <Button size="sm" onClick={onCreateNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">You don't have any savings goals yet.</p>
            <Button onClick={onCreateNew}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <Card key={goal.id} className="border-transparent shadow-sm hover:shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                  <div className="flex justify-between">
                    <span className="text-sm text-neutral-500">
                      {goal.currentAmount} of {goal.targetAmount}
                    </span>
                    <span className="text-sm font-medium">{goal.percentComplete}%</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={goal.percentComplete} className="h-2 mb-4" />
                  
                  <div className="space-y-2 mb-4">
                    {goal.parentMatching && (
                      <div className="bg-cyan-50 text-cyan-800 px-3 py-2 rounded-md text-sm">
                        <span className="font-medium">Parent Match:</span> {goal.parentMatching} of your contributions
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="text-neutral-500">Estimated completion:</span>{" "}
                      <span className="font-medium">{goal.estimatedCompletion}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => goal.onAddFunds(goal.id)}
                    >
                      Add Funds
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goal.onViewDetails(goal.id)}
                    >
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}