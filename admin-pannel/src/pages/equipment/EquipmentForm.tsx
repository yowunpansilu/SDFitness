import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api/axios';

// Form validation schema
const equipmentSchema = z.object({
  // Equipment Information
  name: z.string().min(1, 'Equipment name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().min(1, 'Serial number is required'),
  status: z.enum(['available', 'in-use', 'maintenance', 'broken']),

  // Purchase Details
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  supplierName: z.string().optional(),
  warrantyMonths: z.number().min(0).optional(),

  // Location & Specifications
  location: z.string().min(1, 'Location is required'),
  weightCapacity: z.string().optional(),
  dimensions: z.string().optional(),

  // Maintenance
  maintenanceFrequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).optional(),
  lastMaintenanceDate: z.string().optional(),
  maintenanceNotes: z.string().optional(),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface Specification {
  id: string;
  key: string;
  value: string;
}

const CATEGORIES = ['Cardio', 'Strength', 'Free Weights', 'Machines', 'Accessories', 'Other'];
const LOCATIONS = ['Cardio Zone', 'Weight Room', 'Studio A', 'Studio B', 'Main Hall', 'Storage'];

export function EquipmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [specifications, setSpecifications] = useState<Specification[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: '',
      category: '',
      serialNumber: '',
      status: 'available',
      location: '',
    },
  });

  const warrantyMonths = watch('warrantyMonths');
  const purchaseDate = watch('purchaseDate');

  useEffect(() => {
    if (isEditMode) {
      const fetchEquipment = async () => {
        try {
          const response = await api.get(`/equipment/${id}`);
          const data = response.data;
          reset(data);
          if (data.specifications) setSpecifications(data.specifications);
        } catch (error) {
          console.error('Error fetching equipment:', error);
          toast({
            title: 'Error',
            description: 'Failed to load equipment details',
            variant: 'destructive',
          });
        }
      };
      fetchEquipment();
    }
  }, [id, isEditMode, reset, toast]);

  const onSubmit = async (data: EquipmentFormData) => {
    setLoading(true);
    try {
      const payload = { ...data, specifications };
      if (isEditMode) {
        await api.put(`/equipment/${id}`, payload);
      } else {
        await api.post('/equipment', payload);
      }

      toast({
        title: isEditMode ? 'Equipment Updated' : 'Equipment Added',
        description: `${data.name} has been ${isEditMode ? 'updated' : 'added'} successfully`,
      });

      navigate('/equipment');
    } catch (error) {
      console.error('Error saving equipment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save equipment record',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      {
        id: Date.now().toString(),
        key: '',
        value: '',
      },
    ]);
  };

  const updateSpecification = (id: string, field: keyof Specification, value: string) => {
    setSpecifications(
      specifications.map((spec) =>
        spec.id === id ? { ...spec, [field]: value } : spec
      )
    );
  };

  const removeSpecification = (id: string) => {
    setSpecifications(specifications.filter((spec) => spec.id !== id));
  };

  // Calculate warranty expiry
  const warrantyExpiry =
    purchaseDate && warrantyMonths
      ? new Date(
        new Date(purchaseDate).setMonth(
          new Date(purchaseDate).getMonth() + warrantyMonths
        )
      )
        .toISOString()
        .split('T')[0]
      : null;


  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/equipment')}
            className="w-fit text-slate-500 dark:text-navy-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-800 rounded-xl px-4 py-2 font-bold transition-all group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Inventory
          </Button>
          <div>
            <h1 className="text-5xl font-bold tracking-normal text-slate-900 dark:text-white uppercase">
              {isEditMode ? 'Modify' : 'Deploy'} <span className="text-indigo-600 dark:text-indigo-400">Asset</span>
            </h1>
            <p className="text-slate-500 dark:text-navy-400 font-medium mt-1">
              {isEditMode ? 'Update equipment specifications and maintenance protocols.' : 'Registe a new equipment station for the facility.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/equipment')}
            className="h-12 border-2 border-slate-100 dark:border-navy-800 text-slate-600 dark:text-navy-400 hover:bg-slate-50 dark:hover:bg-navy-900 rounded-2xl px-6 font-bold transition-all flex items-center gap-2 group"
          >
            <X className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Abort
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-2xl px-6 font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4 group-hover:scale-110 transition-transform" />
            )}
            {isEditMode ? 'Update Record' : 'Save Equipment'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-5xl mx-auto">
        {/* Equipment Information */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">Equipment Details</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Equipment Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-navy-800 uppercase tracking-tight"
                  placeholder="E.G. TREADMILL PRO X3000"
                />
                {errors.name && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.name?.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="category" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Category <span className="text-rose-500">*</span>
                </Label>
                <Select value={watch('category')} onValueChange={(value) => setValue('category', value)}>
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category} className="py-3">{category.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.category?.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="status" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Status <span className="text-rose-500">*</span>
                </Label>
                <Select value={watch('status')} onValueChange={(value) => setValue('status', value as 'available' | 'in-use' | 'maintenance' | 'broken')}>
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase">
                    <SelectValue placeholder="Current Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                    <SelectItem value="available" className="py-3">Available</SelectItem>
                    <SelectItem value="in-use" className="py-3">In Use</SelectItem>
                    <SelectItem value="maintenance" className="py-3">Maintenance</SelectItem>
                    <SelectItem value="broken" className="py-3">Broken</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="brand" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Brand
                </Label>
                <Input
                  id="brand"
                  {...register('brand')}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-navy-800 uppercase"
                  placeholder="Brand Name"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="model" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Model
                </Label>
                <Input
                  id="model"
                  {...register('model')}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-navy-800 uppercase"
                  placeholder="X3000-PRO"
                />
              </div>

              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="serialNumber" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Serial Number <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="serialNumber"
                  {...register('serialNumber')}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-navy-800 uppercase font-mono"
                  placeholder="SN-1234-5678"
                />
                {errors.serialNumber && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.serialNumber?.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Details */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">ACQUISITION PULSE</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="purchaseDate" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Deployment Date
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  {...register('purchaseDate')}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="purchasePrice" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Asset Valuation (LKR)
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  {...register('purchasePrice', { valueAsNumber: true })}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  placeholder="3500.00"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="supplierName" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Merchant / Supplier
                </Label>
                <Input
                  id="supplierName"
                  {...register('supplierName')}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-navy-800 uppercase"
                  placeholder="SUPPLIER NAME"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="warrantyMonths" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Warranty Duration (MO)
                </Label>
                <Input
                  id="warrantyMonths"
                  type="number"
                  {...register('warrantyMonths', { valueAsNumber: true })}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  placeholder="36"
                />
              </div>
            </div>

            {warrantyExpiry && (
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 shadow-sm shadow-indigo-500/5">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  🛡️ SAFEGUARD PROTOCOL ACTIVE UNTIL: <span className="text-slate-900 dark:text-white ml-auto">{warrantyExpiry}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location & Specifications */}
        <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 rounded-[2.5rem] shadow-sm transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">ZONE & SPECS</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Operational Sector <span className="text-rose-500">*</span>
                </Label>
                <Select onValueChange={(value) => setValue('location', value)}>
                  <SelectTrigger className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase">
                    <SelectValue placeholder="Select Zone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                    {LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location} className="py-3">{location.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && (
                  <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-2 ml-1">{errors.location?.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="weightCapacity" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Load Capacity
                </Label>
                <Input
                  id="weightCapacity"
                  {...register('weightCapacity')}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-navy-800 uppercase"
                  placeholder="350 LBS"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="dimensions" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Spatial Footprint
                </Label>
                <Input
                  id="dimensions"
                  {...register('dimensions')}
                  className="h-14 bg-slate-50 dark:bg-navy-950/50 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold placeholder:text-slate-300 dark:placeholder:text-navy-800 uppercase"
                  placeholder="60 × 20 × 50 IN"
                />
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-navy-800 transition-colors">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Encrypted Specs</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecification}
                  className="h-9 border-2 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl px-4 font-bold text-[11px] uppercase tracking-widest transition-all shadow-sm shadow-indigo-500/5 group"
                >
                  <Plus className="h-3 w-3 mr-2 group-hover:rotate-90 transition-transform" />
                  Add Specification
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specifications.map((spec) => (
                  <div
                    key={spec.id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50/50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800/50 group transition-all"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        value={spec.key}
                        onChange={(e) => updateSpecification(spec.id, 'key', e.target.value)}
                        placeholder="KEY"
                        className="h-10 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-xs uppercase placeholder:text-slate-300 dark:placeholder:text-navy-800"
                      />
                      <Input
                        value={spec.value}
                        onChange={(e) => updateSpecification(spec.id, 'value', e.target.value)}
                        placeholder="VALUE"
                        className="h-10 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-xs uppercase placeholder:text-slate-300 dark:placeholder:text-navy-800"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSpecification(spec.id)}
                      className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Schedule */}
        <Card className="bg-slate-50 dark:bg-navy-950 border-none rounded-[2.5rem] transition-colors overflow-hidden">
          <CardHeader className="p-10 pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-tight text-slate-400 dark:text-navy-600">MAINTENANCE PROTOCOL</CardTitle>
          </CardHeader>
          <CardContent className="p-10 pt-0 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="maintenanceFrequency" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Execution Frequency
                </Label>
                <Select onValueChange={(value) => setValue('maintenanceFrequency', value as 'weekly' | 'monthly' | 'quarterly' | 'yearly')}>
                  <SelectTrigger className="h-14 bg-white dark:bg-navy-900 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase">
                    <SelectValue placeholder="Select Cadence" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                    <SelectItem value="weekly" className="py-3">WEEKLY CYCLE</SelectItem>
                    <SelectItem value="monthly" className="py-3">MONTHLY PHASE</SelectItem>
                    <SelectItem value="quarterly" className="py-3">QUARTERLY WINDOW</SelectItem>
                    <SelectItem value="yearly" className="py-3">ANNUAL PULSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="lastMaintenanceDate" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                  Last Service Integrity
                </Label>
                <Input
                  id="lastMaintenanceDate"
                  type="date"
                  {...register('lastMaintenanceDate')}
                  className="h-14 bg-white dark:bg-navy-900 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold uppercase"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="maintenanceNotes" className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">
                Encrypted Service Notes
              </Label>
              <Textarea
                id="maintenanceNotes"
                {...register('maintenanceNotes')}
                className="bg-white dark:bg-navy-900 border-slate-100 dark:border-navy-800 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium py-4 text-base min-h-[120px]"
                placeholder="Detail technical requirements and intervention history..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
