import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Props {
  clientId: string;
  clientName: string;
  onClose: () => void;
  onArchived: () => void;
}

export default function ArchiveClientModal({
  clientId,
  clientName,
  onClose,
  onArchived,
}: Props) {
  const [reason, setReason] = useState('');
  const [gracePeriod, setGracePeriod] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please provide a reason for archiving');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc('archive_organization', {
        p_organization_id: clientId,
        p_archive_reason: reason,
        p_grace_period_days: gracePeriod,
      });

      if (error) throw error;

      toast.success('Client archived successfully');
      onArchived();
      onClose();
    } catch (error) {
      console.error('Archive error:', error);
      toast.error('Failed to archive client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Archive Client</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                You are about to archive <span className="font-semibold">{clientName}</span>.
                Their data will be preserved for the specified grace period before being permanently deleted.
              </p>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                Reason for Archiving
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows={3}
                required
              />
            </div>

            <div>
              <label htmlFor="gracePeriod" className="block text-sm font-medium text-gray-700">
                Grace Period (days)
              </label>
              <input
                type="number"
                id="gracePeriod"
                value={gracePeriod}
                onChange={(e) => setGracePeriod(parseInt(e.target.value))}
                min={1}
                max={365}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Client data will be preserved for this many days before deletion
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Archive Client'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}