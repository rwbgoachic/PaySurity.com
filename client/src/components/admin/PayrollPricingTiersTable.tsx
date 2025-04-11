import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit, Plus } from 'lucide-react';

// Pricing tier type definition
interface PricingTier {
  id: number;
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  name: string;
  description: string | null;
  basePrice: string;
  perEmployeePrice: string;
  perContractorPrice: string | null;
  freeContractors: number | null;
  globalPayrollPerEmployeePrice: string | null;
  onDemandPayFee: string | null;
  minEmployees: number | null;
  maxEmployees: number | null;
  isActive: boolean;
  features: any;
  createdAt: string;
  updatedAt: string;
}

// Form for creating/editing pricing tiers
interface PricingTierFormProps {
  tier?: PricingTier;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const PricingTierForm: React.FC<PricingTierFormProps> = ({ tier, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    tier: tier?.tier || 'starter',
    name: tier?.name || '',
    description: tier?.description || '',
    basePrice: tier?.basePrice || '',
    perEmployeePrice: tier?.perEmployeePrice || '',
    perContractorPrice: tier?.perContractorPrice || '',
    freeContractors: tier?.freeContractors?.toString() || '0',
    globalPayrollPerEmployeePrice: tier?.globalPayrollPerEmployeePrice || '',
    onDemandPayFee: tier?.onDemandPayFee || '',
    minEmployees: tier?.minEmployees?.toString() || '1',
    maxEmployees: tier?.maxEmployees?.toString() || '',
    isActive: tier?.isActive !== false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert numeric string fields to numbers
    const processedData = {
      ...formData,
      freeContractors: formData.freeContractors ? parseInt(formData.freeContractors) : null,
      minEmployees: formData.minEmployees ? parseInt(formData.minEmployees) : null,
      maxEmployees: formData.maxEmployees ? parseInt(formData.maxEmployees) : null,
    };
    
    onSubmit(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tier">Tier</Label>
          <Select 
            value={formData.tier} 
            onValueChange={(value) => handleSelectChange('tier', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            placeholder="Tier Name" 
            required 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange}
          placeholder="Tier Description" 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="basePrice">Base Price ($)</Label>
          <Input 
            id="basePrice" 
            name="basePrice" 
            value={formData.basePrice} 
            onChange={handleChange}
            placeholder="0.00" 
            type="text"
            pattern="^\d+(\.\d{1,2})?$"
            required 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="perEmployeePrice">Per Employee Price ($)</Label>
          <Input 
            id="perEmployeePrice" 
            name="perEmployeePrice" 
            value={formData.perEmployeePrice} 
            onChange={handleChange}
            placeholder="0.00" 
            type="text"
            pattern="^\d+(\.\d{1,2})?$"
            required 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="perContractorPrice">Per Contractor Price ($)</Label>
          <Input 
            id="perContractorPrice" 
            name="perContractorPrice" 
            value={formData.perContractorPrice} 
            onChange={handleChange}
            placeholder="0.00" 
            type="text"
            pattern="^\d+(\.\d{1,2})?$"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="freeContractors">Free Contractors</Label>
          <Input 
            id="freeContractors" 
            name="freeContractors" 
            value={formData.freeContractors} 
            onChange={handleChange}
            placeholder="0" 
            type="number"
            min="0"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="globalPayrollPerEmployeePrice">Global Payroll Per Employee ($)</Label>
          <Input 
            id="globalPayrollPerEmployeePrice" 
            name="globalPayrollPerEmployeePrice" 
            value={formData.globalPayrollPerEmployeePrice} 
            onChange={handleChange}
            placeholder="0.00" 
            type="text"
            pattern="^\d+(\.\d{1,2})?$"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="onDemandPayFee">On-Demand Pay Fee ($)</Label>
          <Input 
            id="onDemandPayFee" 
            name="onDemandPayFee" 
            value={formData.onDemandPayFee} 
            onChange={handleChange}
            placeholder="0.00" 
            type="text"
            pattern="^\d+(\.\d{1,2})?$"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minEmployees">Min Employees</Label>
          <Input 
            id="minEmployees" 
            name="minEmployees" 
            value={formData.minEmployees} 
            onChange={handleChange}
            placeholder="1" 
            type="number"
            min="1"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxEmployees">Max Employees</Label>
          <Input 
            id="maxEmployees" 
            name="maxEmployees" 
            value={formData.maxEmployees} 
            onChange={handleChange}
            placeholder="No Maximum" 
            type="number"
            min="1"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          id="isActive"
          name="isActive"
          type="checkbox"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {tier ? 'Update' : 'Create'} Pricing Tier
        </Button>
      </DialogFooter>
    </form>
  );
};

export const PayrollPricingTiersTable: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null);
  
  // Fetch pricing tiers
  const { data: pricingTiers = [], isLoading, isError } = useQuery({
    queryKey: ['/api/payroll/pricing/tiers'],
    queryFn: async () => {
      const response = await fetch('/api/payroll/pricing/tiers');
      if (!response.ok) {
        throw new Error('Failed to fetch pricing tiers');
      }
      return response.json();
    }
  });

  // Create pricing tier mutation
  const createPricingTierMutation = useMutation({
    mutationFn: async (tierData: any) => {
      const response = await apiRequest('POST', '/api/payroll/pricing/tiers', tierData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create pricing tier');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Pricing tier created successfully',
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/pricing/tiers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update pricing tier mutation
  const updatePricingTierMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/payroll/pricing/tiers/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update pricing tier');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Pricing tier updated successfully',
      });
      setEditingTier(null);
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/pricing/tiers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete pricing tier mutation
  const deletePricingTierMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/payroll/pricing/tiers/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete pricing tier');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Pricing tier deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/pricing/tiers'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleAddTier = (formData: any) => {
    createPricingTierMutation.mutate(formData);
  };

  const handleEditTier = (formData: any) => {
    if (editingTier) {
      updatePricingTierMutation.mutate({ id: editingTier.id, data: formData });
    }
  };

  const handleDeleteTier = (id: number) => {
    if (confirm('Are you sure you want to delete this pricing tier?')) {
      deletePricingTierMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading pricing tiers...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-8">Error loading pricing tiers.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payroll Pricing Tiers</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Pricing Tier
        </Button>
      </div>
      
      <Table>
        <TableCaption>List of available payroll pricing tiers.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead>Per Employee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pricingTiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center">No pricing tiers found.</TableCell>
            </TableRow>
          ) : (
            pricingTiers.map((tier: PricingTier) => (
              <TableRow key={tier.id}>
                <TableCell>{tier.id}</TableCell>
                <TableCell className="capitalize">{tier.tier}</TableCell>
                <TableCell>{tier.name}</TableCell>
                <TableCell>${parseFloat(tier.basePrice).toFixed(2)}</TableCell>
                <TableCell>${parseFloat(tier.perEmployeePrice).toFixed(2)}</TableCell>
                <TableCell>
                  <span className={tier.isActive ? "text-green-600" : "text-red-600"}>
                    {tier.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingTier(tier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteTier(tier.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Add Pricing Tier Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Pricing Tier</DialogTitle>
            <DialogDescription>
              Create a new payroll pricing tier with features and pricing details.
            </DialogDescription>
          </DialogHeader>
          <PricingTierForm 
            onSubmit={handleAddTier} 
            onCancel={() => setIsAddDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Pricing Tier Dialog */}
      <Dialog 
        open={!!editingTier} 
        onOpenChange={(open) => !open && setEditingTier(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Pricing Tier</DialogTitle>
            <DialogDescription>
              Update the pricing tier details and features.
            </DialogDescription>
          </DialogHeader>
          {editingTier && (
            <PricingTierForm 
              tier={editingTier}
              onSubmit={handleEditTier} 
              onCancel={() => setEditingTier(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};