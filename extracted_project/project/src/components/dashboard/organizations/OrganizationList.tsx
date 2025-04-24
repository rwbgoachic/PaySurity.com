import React from 'react';
import { useOrganizations } from '../../../hooks/useOrganizations';
import { Loader2, Building2, MapPin } from 'lucide-react';

interface Props {
  onSelect?: (organizationId: string) => void;
}

export default function OrganizationList({ onSelect }: Props) {
  const { organizations, loading } = useOrganizations();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No organizations</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new organization.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <div
          key={org.id}
          className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelect?.(org.id)}
        >
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">{org.name}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {org.business_line?.name}
            </p>
          </div>
          <div className="px-4 py-4 sm:px-6">
            <div className="text-sm text-gray-500">
              <div className="flex items-center mb-2">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{org.locations?.length || 0} Locations</span>
              </div>
              <div>
                <span className="font-medium">Subdomain: </span>
                {org.subdomain}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}