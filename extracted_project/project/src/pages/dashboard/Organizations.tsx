import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import OrganizationList from '../../components/dashboard/organizations/OrganizationList';
import CreateOrganizationForm from '../../components/dashboard/organizations/CreateOrganizationForm';
import LocationList from '../../components/dashboard/locations/LocationList';

export default function OrganizationsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage organizations across different business lines
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Organization
          </Button>
        </div>

        <OrganizationList onSelect={setSelectedOrganization} />
      </div>

      {selectedOrganization && (
        <LocationList organizationId={selectedOrganization} />
      )}

      {showCreateForm && (
        <CreateOrganizationForm onClose={() => setShowCreateForm(false)} />
      )}
    </div>
  );
}