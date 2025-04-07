import { ExpenseLineItem } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type ExpenseLineItemListProps = {
  items: ExpenseLineItem[];
  onEditItem?: (item: ExpenseLineItem) => void;
  onDeleteItem?: (id: number) => void;
  isEditable: boolean;
};

export function ExpenseLineItemList({
  items,
  onEditItem,
  onDeleteItem,
  isEditable,
}: ExpenseLineItemListProps) {
  if (!items.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No expense items have been added yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Receipt</TableHead>
            {isEditable && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {format(new Date(item.date), "MMM dd, yyyy")}
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] line-clamp-2">{item.description}</div>
                {item.notes && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {item.notes}
                  </div>
                )}
              </TableCell>
              <TableCell>{item.merchant}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(parseFloat(item.amount))}
              </TableCell>
              <TableCell>
                {item.receiptUrl ? (
                  <a
                    href={item.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View
                  </a>
                ) : (
                  <span className="text-gray-500 text-sm">None</span>
                )}
              </TableCell>
              {isEditable && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditItem?.(item)}
                      title="Edit item"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteItem?.(item.id)}
                      title="Delete item"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
          {items.length > 0 && (
            <TableRow className="bg-gray-50">
              <TableCell colSpan={4} className="text-right font-bold">
                Total:
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(
                  items.reduce(
                    (total, item) => total + parseFloat(item.amount),
                    0
                  )
                )}
              </TableCell>
              <TableCell colSpan={isEditable ? 2 : 1}></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}