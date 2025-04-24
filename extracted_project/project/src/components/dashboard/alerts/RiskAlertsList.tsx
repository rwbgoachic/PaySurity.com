import React, { useState, useEffect } from 'react';
import { useOrganization } from '../../../hooks/useOrganization';
import { supabase } from '../../../lib/supabase';
import { Loader2, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Button from '../../ui/Button';
import Decimal from 'decimal.js';

interface CashflowAlert {
  id: string;
  organization_id: string;
  alert_type: string;
  threshold: string;
  current_value: string;
  triggered_at: string;
  resolved_at: string | null;
}

interface FraudAlert {
  id: string;
  organization_id: string;
  transaction_id: string;
  reason: string;
  status: 'pending' | 'resolved';
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
}

export default function RiskAlertsList({ organizationId }: { organizationId: string }) {
  const [cashflowAlerts, setCashflowAlerts] = useState<CashflowAlert[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { organization } = useOrganization(organizationId);

  useEffect(() => {
    if (organizationId) {
      fetchAlerts();
    }
  }, [organizationId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Fetch cashflow alerts
      const { data: cashflow, error: cashflowError } = await supabase
        .from('cashflow_alerts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('triggered_at', { ascending: false });
      
      if (cashflowError) throw cashflowError;
      
      // Fetch fraud alerts
      const { data: fraud, error: fraudError } = await supabase
        .from('fraud_alerts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });
      
      if (fraudError) throw fraudError;
      
      setCashflowAlerts(cashflow || []);
      setFraudAlerts(fraud || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (type: 'cashflow' | 'fraud', id: string) => {
    try {
      if (type === 'cashflow') {
        const { error } = await supabase
          .from('cashflow_alerts')
          .update({ resolved_at: new Date().toISOString() })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fraud_alerts')
          .update({ 
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            resolved_by: supabase.auth.getUser().then(res => res.data.user?.id)
          })
          .eq('id', id);
        
        if (error) throw error;
      }
      
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const formatCurrency = (value: string) => {
    return new Decimal(value).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const hasAlerts = cashflowAlerts.length > 0 || fraudAlerts.length > 0;

  if (!hasAlerts) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6 text-center">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="mt-2 text-lg font-medium">No active alerts</h3>
        <p className="mt-1 text-gray-500">
          Your business is operating normally with no detected risks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cashflow Alerts */}
      {cashflowAlerts.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Cashflow Alerts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {cashflowAlerts.map((alert) => (
              <div key={alert.id} className={`p-6 ${alert.resolved_at ? 'bg-gray-50' : 'bg-yellow-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <AlertTriangle className={`h-5 w-5 mr-3 ${alert.resolved_at ? 'text-gray-400' : 'text-yellow-500'}`} />
                    <div>
                      <h3 className="text-sm font-medium">
                        {alert.alert_type === 'LOW_BALANCE' ? 'Low Balance Alert' : alert.alert_type}
                        {alert.resolved_at && <span className="ml-2 text-xs text-gray-500">(Resolved)</span>}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        Current balance (${formatCurrency(alert.current_value)}) is below threshold (${formatCurrency(alert.threshold)})
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Triggered {formatDistanceToNow(new Date(alert.triggered_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {!alert.resolved_at && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => resolveAlert('cashflow', alert.id)}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fraud Alerts */}
      {fraudAlerts.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Fraud Alerts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {fraudAlerts.map((alert) => (
              <div key={alert.id} className={`p-6 ${alert.status === 'resolved' ? 'bg-gray-50' : 'bg-red-50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <AlertTriangle className={`h-5 w-5 mr-3 ${alert.status === 'resolved' ? 'text-gray-400' : 'text-red-500'}`} />
                    <div>
                      <h3 className="text-sm font-medium">
                        Suspicious Transaction
                        {alert.status === 'resolved' && <span className="ml-2 text-xs text-gray-500">(Resolved)</span>}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {alert.reason}
                      </p>
                      <div className="mt-2 flex items-center">
                        <Button 
                          variant="link" 
                          size="sm"
                          className="p-0 h-auto text-xs text-blue-600"
                        >
                          View Transaction <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Detected {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {alert.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => resolveAlert('fraud', alert.id)}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}