import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useBusinessLines } from '../../../hooks/useBusinessLines';
import { useAuth } from '../../../contexts/AuthContext';

const addClientSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().refine((val) => {
    const phoneNumber = parsePhoneNumberFromString(val);
    return phoneNumber?.isValid() || false;
  }, 'Invalid phone number'),
  businessLineId: z.string().min(1, 'Please select a service'),
});

type AddClientForm = z.infer<typeof addClientSchema>;

export default function AddClient() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { businessLines, loading: loadingBusinessLines } = useBusinessLines();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddClientForm>({
    resolver: zodResolver(addClientSchema),
  });

  const onSubmit = async (data: AddClientForm) => {
    try {
      // Create audit log entry
      const { error: auditError } = await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'manual_onboarding_triggered',
        table_name: 'organizations',
        new_data: {
          business_name: data.businessName,
          email: data.email,
          business_line_id: data.businessLineId
        }
      });

      if (auditError) throw auditError;

      // Create verification token
      const { error: tokenError } = await supabase.rpc('create_verification_token', {
        p_email: data.email,
        p_phone: data.phone,
        p_business_name: data.businessName,
        p_business_line_id: data.businessLineId,
      });

      if (tokenError) throw tokenError;

      toast.success('Verification code sent to client');
      navigate('/admin/clients');
    } catch (error) {
      console.error('Add client error:', error);
      toast.error('Failed to add client. Please try again.');
    }
  };

  if (loadingBusinessLines) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Client</h1>
        <p className="mt-2 text-gray-600">
          Manually onboard a new client to the platform
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              id="businessName"
              type="text"
              {...register('businessName')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="+1 (555) 555-5555"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="businessLineId" className="block text-sm font-medium text-gray-700">
              Service
            </label>
            <select
              id="businessLineId"
              {...register('businessLineId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a service...</option>
              {businessLines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.name}
                </option>
              ))}
            </select>
            {errors.businessLineId && (
              <p className="mt-1 text-sm text-red-600">{errors.businessLineId.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/clients')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Add Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}