import { Card, CardContent } from "@/components/ui/card";

interface ExpenseCategory {
  name: string;
  amount: string;
  percentage: number;
  color: string;
}

interface ExpenseCategoriesProps {
  categories: ExpenseCategory[];
}

export default function ExpenseCategories({ categories }: ExpenseCategoriesProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-base font-medium text-neutral-700 mb-4">Expense Categories</h2>
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span>{category.name}</span>
                <span className="font-medium">{category.amount}</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className={`${category.color} h-2 rounded-full`} 
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
