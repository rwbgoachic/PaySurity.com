import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useTransactions } from '../../../hooks/useTransactions';
import Button from '../../ui/Button';

const transactionSchema = z.object({
  service_type: z.string().min(1, 'Service type is required'),
  amount: z.string()
    .min(1, 'Amount is required')
    .regex(/^\d*\.?\d{0,4}$/, 'Amount must have at most 4 decimal places')
    .refine(val => parseFloat(val) > 0, 'Amount must be greater than 0'),
  description: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  organizationId: string;
  onSuccess?: () => void;
}

export default function TransactionForm({ organizationId, onSuccess }: TransactionFormProps) {
  const { createTransaction } = useTransactions(organizationId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      service_type: 'pos',
      amount: '',
      description: '',
    }
  });

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsSubmitting(true);
      await createTransaction({
        service_type: data.service_type,
        amount: data.amount,
      });
      
      reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Transaction submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="service_type" className="block text-sm font-medium text-gray-700">
          Service Type
        </label>
        <select
          id="service_type"
          {...register('service_type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="pos">Point of Sale</option>
          <option value="payroll">Payroll</option>
          <option value="subscription">Subscription</option>
          <option value="invoice">Invoice</option>
        </select>
        {errors.service_type && (
          <p className="mt-1 text-sm text-red-600">{errors.service_type.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="text"
            id="amount"
            {...register('amount')}
            className="pl-7 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.0000"
          />
        </div>
        {errors.amount && (
          <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Supports up to 4 decimal places of precision (e.g., 123.4567)
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (Optional)
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Record Transaction'
          )}
        </Button>
      </div>
    </form>
  );
}