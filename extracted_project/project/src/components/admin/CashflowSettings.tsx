import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { CashflowManager } from '../../lib/finance';
import Decimal from 'decimal.js';

const settingsSchema = z.object({
  cashflowThreshold: z.string()
    .regex(/^\d*\.?\d{0,4}$/, 'Amount must have at most 4 decimal places')
    .transform(val => new Decimal(val || '0')),
  alertEmail: z.string().email('Invalid email address'),
  alertThreshold: z.string()
    .regex(/^\d*\.?\d{0,4}$/, 'Amount must have at most 4 decimal places')
    .transform(val => new Decimal(val || '0')),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function CashflowSettings({ organizationId }: { organizationId: string }) {
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    loadSettings();
  }, [organizationId]);

  const loadSettings = async () => {
    try {
      const { data: org, error } = await supabase
        .from('organizations')
        .select('cashflow_threshold, alert_email, alert_threshold')
        .eq('id', organizationId)
        .single();

      if (error) throw error;

      if (org) {
        setValue('cashflowThreshold', org.cashflow_threshold || '');
        setValue('alertEmail', org.alert_email || '');
        setValue('alertThreshold', org.alert_threshold || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SettingsForm) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          cashflow_threshold: data.cashflowThreshold.toFixed(4),
          alert_email: data.alertEmail,
          alert_threshold: data.alertThreshold.toFixed(4),
        })
        .eq('id', organizationId);

      if (error) throw error;
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Cashflow Alert Settings</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Cash Reserve
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                {...register('cashflowThreshold')}
                className="pl-7 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.0000"
              />
            </div>
            {errors.cashflowThreshold && (
              <p className="mt-1 text-sm text-red-600">{errors.cashflowThreshold.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Minimum cash reserve to maintain (supports 4 decimal precision)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alert Email
            </label>
            <input
              type="email"
              {...register('alertEmail')}
              className="mt-1 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.alertEmail && (
              <p className="mt-1 text-sm text-red-600">{errors.alertEmail.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Email address to receive alerts
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Alert Threshold
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="text"
                {...register('alertThreshold')}
                className="pl-7 block w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.0000"
              />
            </div>
            {errors.alertThreshold && (
              <p className="mt-1 text-sm text-red-600">{errors.alertThreshold.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Send alert when balance falls below this amount
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}