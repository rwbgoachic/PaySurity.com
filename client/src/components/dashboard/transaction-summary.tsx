import { Card, CardContent } from "@/components/ui/card";

interface TransactionSummaryItem {
  label: string;
  value: string;
  color?: string;
}

interface TransactionSummaryProps {
  title: string;
  data: TransactionSummaryItem[];
}

export default function TransactionSummary({ title, data }: TransactionSummaryProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-base font-medium text-neutral-700 mb-4">{title}</h2>
        <div className="grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={index}>
              <p className="text-sm text-neutral-500">{item.label}</p>
              <p 
                className={`text-xl font-semibold ${
                  item.color ? item.color : "text-neutral-900"
                }`}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
