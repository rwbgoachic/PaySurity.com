import React, { useState } from 'react';
import { useLocations } from '../../../hooks/useLocations';
import { Loader2, MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import Button from '../../ui/Button';
import CreateLocationForm from './CreateLocationForm';
import EditLocationForm from './EditLocationForm';
import { Database } from '../../../types/supabase';

type Location = Database['public']['Tables']['locations']['Row'];

interface Props {
  organizationId: string;
}

export default function LocationList({ organizationId }: Props) {
  const { locations, loading, deleteLocation } = useLocations(organizationId);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="p-6 flex justify-between items-center border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Locations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your organization's locations
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No locations</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by adding a new location.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => (
                <tr key={location.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {location.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {location.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingLocation(location)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLocation(location.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateForm && (
        <CreateLocationForm
          organizationId={organizationId}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {editingLocation && (
        <EditLocationForm
          location={editingLocation}
          onClose={() => setEditingLocation(null)}
        />
      )}
    </div>
  );
}