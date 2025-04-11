import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { Trash2, Edit, Plus, Check, X } from 'lucide-react';

// Feature type definition
interface PricingFeature {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  isStandard: boolean | null;
  createdAt: string;
  updatedAt: string;
}

// Tier feature availability type
interface FeatureAvailability {
  id: number;
  pricingId: number;
  featureId: number;
  isIncluded: boolean;
  additionalCost: string | null;
  isLimited: boolean;
  limitDetails: string | null;
  feature: PricingFeature;
}

// Form for creating/editing features
interface FeatureFormProps {
  feature?: PricingFeature;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const FeatureForm: React.FC<FeatureFormProps> = ({ feature, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: feature?.name || '',
    description: feature?.description || '',
    category: feature?.category || '',
    isStandard: feature?.isStandard || false,
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
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Feature Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={formData.name} 
          onChange={handleChange}
          placeholder="Feature Name" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange}
          placeholder="Feature Description" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select 
          value={formData.category || ''} 
          onValueChange={(value) => handleSelectChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="core">Core</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="payments">Payments</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="international">International</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          id="isStandard"
          name="isStandard"
          type="checkbox"
          checked={formData.isStandard}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="isStandard">Standard Feature</Label>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {feature ? 'Update' : 'Create'} Feature
        </Button>
      </DialogFooter>
    </form>
  );
};

// Feature availability form for a specific tier
interface FeatureAvailabilityFormProps {
  tierName: string;
  tierId: number;
  features: FeatureAvailability[];
  onClose: () => void;
}

const FeatureAvailabilityForm: React.FC<FeatureAvailabilityFormProps> = ({ 
  tierName, 
  tierId, 
  features, 
  onClose 
}) => {
  const { toast } = useToast();
  const [updatedFeatures, setUpdatedFeatures] = useState<Record<number, {
    isIncluded: boolean;
    additionalCost: string;
    isLimited: boolean;
    limitDetails: string;
  }>>({});

  // Initialize with current feature values
  React.useEffect(() => {
    const initialUpdates: Record<number, any> = {};
    features.forEach(feature => {
      initialUpdates[feature.featureId] = {
        isIncluded: feature.isIncluded,
        additionalCost: feature.additionalCost || '',
        isLimited: feature.isLimited,
        limitDetails: feature.limitDetails || '',
      };
    });
    setUpdatedFeatures(initialUpdates);
  }, [features]);

  const updateFeatureMutation = useMutation({
    mutationFn: async ({ featureId, data }: { featureId: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/payroll/pricing/tiers/${tierId}/features/${featureId}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update feature availability');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Feature availability updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/payroll/pricing/tiers/${tierId}/features`] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleToggleIncluded = (featureId: number) => {
    setUpdatedFeatures(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        isIncluded: !prev[featureId].isIncluded
      }
    }));
  };

  const handleToggleLimited = (featureId: number) => {
    setUpdatedFeatures(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        isLimited: !prev[featureId].isLimited
      }
    }));
  };

  const handleInputChange = (featureId: number, field: string, value: string) => {
    setUpdatedFeatures(prev => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [field]: value
      }
    }));
  };

  const handleSaveChanges = async (featureId: number) => {
    const data = updatedFeatures[featureId];
    await updateFeatureMutation.mutate({ featureId, data });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Feature Availability for {tierName}</h3>
        <p className="text-sm text-muted-foreground">
          Configure which features are included in this pricing tier.
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Feature</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Included</TableHead>
            <TableHead>Additional Cost</TableHead>
            <TableHead>Limited</TableHead>
            <TableHead>Limit Details</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature) => {
            const featureData = updatedFeatures[feature.featureId];
            if (!featureData) return null;
            
            return (
              <TableRow key={feature.id}>
                <TableCell>{feature.feature.name}</TableCell>
                <TableCell className="capitalize">{feature.feature.category || 'N/A'}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleIncluded(feature.featureId)}
                  >
                    {featureData.isIncluded ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                  </Button>
                </TableCell>
                <TableCell>
                  {!featureData.isIncluded && (
                    <Input 
                      value={featureData.additionalCost || ''}
                      onChange={(e) => handleInputChange(feature.featureId, 'additionalCost', e.target.value)}
                      placeholder="Additional cost"
                      className="w-20"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleLimited(feature.featureId)}
                    disabled={!featureData.isIncluded}
                  >
                    {featureData.isLimited ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                  </Button>
                </TableCell>
                <TableCell>
                  {featureData.isIncluded && featureData.isLimited && (
                    <Input 
                      value={featureData.limitDetails || ''}
                      onChange={(e) => handleInputChange(feature.featureId, 'limitDetails', e.target.value)}
                      placeholder="Limit details"
                      className="w-32"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSaveChanges(feature.featureId)}
                  >
                    Save
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </div>
  );
};

export const PayrollPricingFeaturesTable: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<PricingFeature | null>(null);
  const [selectedTier, setSelectedTier] = useState<{ id: number; name: string } | null>(null);
  
  // Fetch features
  const { data: features = [], isLoading, isError } = useQuery({
    queryKey: ['/api/payroll/pricing/features'],
    queryFn: async () => {
      const response = await fetch('/api/payroll/pricing/features');
      if (!response.ok) {
        throw new Error('Failed to fetch pricing features');
      }
      return response.json();
    }
  });

  // Fetch pricing tiers for selecting which tier to configure features for
  const { data: pricingTiers = [] } = useQuery({
    queryKey: ['/api/payroll/pricing/tiers'],
    queryFn: async () => {
      const response = await fetch('/api/payroll/pricing/tiers');
      if (!response.ok) {
        throw new Error('Failed to fetch pricing tiers');
      }
      return response.json();
    }
  });

  // Fetch feature availability for a specific tier when selected
  const { data: tierFeatures = [], isLoading: isLoadingTierFeatures } = useQuery({
    queryKey: [`/api/payroll/pricing/tiers/${selectedTier?.id}/features`],
    queryFn: async () => {
      if (!selectedTier) return [];
      const response = await fetch(`/api/payroll/pricing/tiers/${selectedTier.id}/features`);
      if (!response.ok) {
        throw new Error('Failed to fetch tier features');
      }
      return response.json();
    },
    enabled: !!selectedTier
  });

  // Create feature mutation
  const createFeatureMutation = useMutation({
    mutationFn: async (featureData: any) => {
      const response = await apiRequest('POST', '/api/payroll/pricing/features', featureData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create feature');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Feature created successfully',
      });
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/pricing/features'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update feature mutation
  const updateFeatureMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PUT', `/api/payroll/pricing/features/${id}`, data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update feature');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Feature updated successfully',
      });
      setEditingFeature(null);
      queryClient.invalidateQueries({ queryKey: ['/api/payroll/pricing/features'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleAddFeature = (formData: any) => {
    createFeatureMutation.mutate(formData);
  };

  const handleEditFeature = (formData: any) => {
    if (editingFeature) {
      updateFeatureMutation.mutate({ id: editingFeature.id, data: formData });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading pricing features...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-8">Error loading pricing features.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payroll Pricing Features</h2>
        <div className="space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Feature
          </Button>
          <Select 
            value={selectedTier?.id?.toString() || ''} 
            onValueChange={(value) => {
              const tier = pricingTiers.find((t: any) => t.id.toString() === value);
              setSelectedTier(tier ? { id: tier.id, name: tier.name } : null);
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Configure Tier Features" />
            </SelectTrigger>
            <SelectContent>
              {pricingTiers.map((tier: any) => (
                <SelectItem key={tier.id} value={tier.id.toString()}>
                  {tier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Table>
        <TableCaption>List of available pricing features that can be assigned to pricing tiers.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Standard</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">No features found.</TableCell>
            </TableRow>
          ) : (
            features.map((feature: PricingFeature) => (
              <TableRow key={feature.id}>
                <TableCell>{feature.id}</TableCell>
                <TableCell>{feature.name}</TableCell>
                <TableCell>{feature.description || 'N/A'}</TableCell>
                <TableCell className="capitalize">{feature.category || 'N/A'}</TableCell>
                <TableCell>
                  {feature.isStandard ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingFeature(feature)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Add Feature Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
            <DialogDescription>
              Create a new feature that can be assigned to pricing tiers.
            </DialogDescription>
          </DialogHeader>
          <FeatureForm 
            onSubmit={handleAddFeature} 
            onCancel={() => setIsAddDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Feature Dialog */}
      <Dialog 
        open={!!editingFeature} 
        onOpenChange={(open) => !open && setEditingFeature(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Feature</DialogTitle>
            <DialogDescription>
              Update the feature details.
            </DialogDescription>
          </DialogHeader>
          {editingFeature && (
            <FeatureForm 
              feature={editingFeature}
              onSubmit={handleEditFeature} 
              onCancel={() => setEditingFeature(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Configure Tier Features Dialog */}
      <Dialog 
        open={!!selectedTier} 
        onOpenChange={(open) => !open && setSelectedTier(null)}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Configure Features for {selectedTier?.name}</DialogTitle>
            <DialogDescription>
              Manage which features are included in this pricing tier.
            </DialogDescription>
          </DialogHeader>
          {selectedTier && !isLoadingTierFeatures && (
            <FeatureAvailabilityForm 
              tierName={selectedTier.name}
              tierId={selectedTier.id}
              features={tierFeatures}
              onClose={() => setSelectedTier(null)}
            />
          )}
          {isLoadingTierFeatures && (
            <div className="flex justify-center p-4">Loading tier features...</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};