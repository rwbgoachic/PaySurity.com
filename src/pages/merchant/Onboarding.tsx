import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface FormData {
  businessName: string;
  businessType: string;
  taxId: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessType: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase
        .from('merchant_profiles')
        .insert([
          {
            user_id: user?.id,
            business_name: formData.businessName,
            business_type: formData.businessType,
            tax_id: formData.taxId,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            phone: formData.phone,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      navigate('/merchant/dashboard');
    } catch (err) {
      console.error('Error during onboarding:', err);
      setError('Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-3xl font-bold text-white mb-8">Complete Your Profile</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-white">
                  Business Name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-white">
                  Business Type
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  required
                  value={formData.businessType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-white"
                >
                  <option value="">Select a type</option>
                  <option value="retail">Retail</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="service">Service</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="taxId" className="block text-sm font-medium text-white">
                  Tax ID
                </label>
                <input
                  type="text"
                  id="taxId"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-white">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-white">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-white">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-white">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-white"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 bg-white/5 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}