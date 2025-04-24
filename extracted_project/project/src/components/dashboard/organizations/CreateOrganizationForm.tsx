import React, { useState } from 'react';
import { useOrganizations } from '../../../hooks/useOrganizations';
import { useBusinessLines } from '../../../hooks/useBusinessLines';
import Button from '../../ui/Button';
import { X, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function CreateOrganizationForm({ onClose }: Props) {
  const { createOrganization } = useOrganizations();
  const { businessLines, loading: loadingBusinessLines } = useBusinessLines();
  const [formData, setFormData] = useState({
    name: '',
    business_line_id: '',
    subdomain: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createOrganization(formData);
    onClose();
  };

  if (loadingBusinessLines) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Create Organization</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                Subdomain
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="subdomain"
                  value={formData.subdomain}
                  onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                  className="block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
                <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  .paysurity.com
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="business_line" className="block text-sm font-medium text-gray-700">
                Business Line
              </label>
              <select
                id="business_line"
                value={formData.business_line_id}
                onChange={(e) => setFormData({ ...formData, business_line_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="">Select a business line</option>
                {businessLines.map((businessLine) => (
                  <option key={businessLine.id} value={businessLine.id}>
                    {businessLine.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Organization
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}