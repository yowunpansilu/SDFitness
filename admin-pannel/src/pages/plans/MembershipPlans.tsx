import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Users, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { membershipService } from '@/services/membershipService';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const membershipPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  price: z.number().min(1, 'Price must be at least 1 LKR'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  features: z.string().min(2, 'At least one feature is required'),
  duration: z.number().min(1, 'Duration must be at least 1'),
  durationType: z.enum(['days', 'months']),
});

type MembershipPlanFormData = z.infer<typeof membershipPlanSchema>;

interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  durationType: 'days' | 'months';
  features: string[];
  isActive: boolean;
  memberCount: number;
  color: string;
}

const planColors: Record<string, string> = {
  'Basic': 'from-slate-400 to-slate-500 ',
  'Premium': 'from-indigo-500 to-violet-600',
  'VIP': 'from-amber-500 to-orange-600',
  'Student': 'from-emerald-500 to-teal-600',
};

export function MembershipPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const { toast } = useToast();

  const formMethods = useForm<MembershipPlanFormData>({
    resolver: zodResolver(membershipPlanSchema),
    defaultValues: {
      name: '',
      price: 0,
      description: '',
      features: '',
      duration: 1,
      durationType: 'months',
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = formMethods;

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await membershipService.getPlans();
      if (response.success) {
        setPlans(response.data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch membership plans.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const response = await membershipService.updatePlan(planId, { isActive: !currentStatus });
      if (response.success) {
        setPlans(plans.map(plan =>
          plan.id === planId ? { ...plan, isActive: !currentStatus } : plan
        ));
        toast({
          title: 'Success',
          description: `Plan status updated to ${!currentStatus ? 'active' : 'inactive'}.`,
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update plan status.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setValue('name', plan.name);
    setValue('price', plan.price);
    setValue('description', plan.description);
    setValue('features', (plan.features || []).join('\n'));
    setValue('duration', plan.duration);
    setValue('durationType', plan.durationType);
    setOpenDialog(true);
  };

  const handleDelete = async (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        const response = await membershipService.deletePlan(planId);
        if (response.success) {
          setPlans(plans.filter(plan => plan.id !== planId));
          toast({
            title: 'Success',
            description: 'Plan deleted successfully.',
          });
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to delete plan.',
          variant: 'destructive',
        });
      }
    }
  };

  const onSubmit = async (data: MembershipPlanFormData) => {
    try {
      const payload = {
        ...data,
        features: data.features.split('\n').filter(f => f.trim() !== ''),
      };

      let response;
      if (editingPlan) {
        response = await membershipService.updatePlan(editingPlan.id, payload);
      } else {
        response = await membershipService.createPlan(payload);
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: `Plan ${editingPlan ? 'updated' : 'created'} successfully.`,
        });
        setOpenDialog(false);
        fetchPlans();
        resetForm();
      }
    } catch {
      toast({
        title: 'Error',
        description: `Failed to ${editingPlan ? 'update' : 'create'} plan.`,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    reset({
      name: '',
      price: 0,
      description: '',
      features: '',
      duration: 1,
      durationType: 'months',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white uppercase transition-colors">
            Membership <span className="text-indigo-600 dark:text-indigo-400">Plans</span>
          </h1>
          <p className="text-slate-500 dark:text-navy-400 font-medium mt-1">
            Manage membership tiers, pricing, and features.
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-950/20 h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4 mr-2" />
              Add New Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 text-slate-900 dark:text-white max-w-2xl rounded-[2rem] overflow-hidden p-0 gap-0 shadow-2xl">
            <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-navy-950/50 border-b border-slate-100 dark:border-navy-800">
              <DialogTitle className="text-2xl font-bold uppercase tracking-tight">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-navy-400 font-medium">
                {editingPlan ? 'Modify the details of this membership plan.' : 'Define the features and pricing for a new plan.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-8 py-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-500">Plan Name</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="e.g. Premium Plan"
                      className={cn(
                        "h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold dark:text-white",
                        errors.name && "ring-2 ring-rose-500/50"
                      )}
                    />
                    {errors.name && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-500">Price (LKR)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="Monthly price"
                      className={cn(
                        "h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold dark:text-white",
                        errors.price && "ring-2 ring-rose-500/50"
                      )}
                    />
                    {errors.price && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.price.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-500">Duration</Label>
                    <Input
                      id="duration"
                      type="number"
                      {...register('duration', { valueAsNumber: true })}
                      className={cn(
                        "h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold dark:text-white",
                        errors.duration && "ring-2 ring-rose-500/50"
                      )}
                    />
                    {errors.duration && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.duration.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationType" className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-500">Duration Type</Label>
                    <select
                      id="durationType"
                      {...register('durationType')}
                      className="w-full h-11 bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold dark:text-white px-3"
                    >
                      <option value="days">Days</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-500">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Provide a brief summary of the plan benefits..."
                    className={cn(
                      "bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-medium min-h-[80px] dark:text-white",
                      errors.description && "ring-2 ring-rose-500/50"
                    )}
                  />
                  {errors.description && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.description.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features" className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-500">Features (One per line)</Label>
                  <Textarea
                    id="features"
                    {...register('features')}
                    placeholder="24/7 access&#10;Group classes&#10;Free water..."
                    className={cn(
                      "bg-slate-50 dark:bg-navy-950 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-medium min-h-[120px] dark:text-white",
                      errors.features && "ring-2 ring-rose-500/50"
                    )}
                  />
                  {errors.features && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{errors.features.message}</p>}
                </div>
              </div>
              <DialogFooter className="p-8 pt-4 bg-slate-50/50 dark:bg-navy-950/50 border-t border-slate-100 dark:border-navy-800">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setOpenDialog(false);
                    resetForm();
                  }}
                  className="h-11 rounded-xl font-bold uppercase text-xs tracking-widest text-slate-400 dark:text-navy-500 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-bold uppercase text-xs tracking-widest shadow-lg shadow-indigo-200 dark:shadow-indigo-950/20 transition-all"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingPlan ? 'Save Changes' : 'Create Plan')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-navy-400">Total Plans</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-sm">
              <Plus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{plans.length}</div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Defined tiers</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Live Plans</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-sm">
              <Check className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {plans.filter(p => p.isActive).length}
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Publicly available</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">User Base</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-sm">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {plans.reduce((sum, plan) => sum + (plan.memberCount || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Total subscribers</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">Monthly Revenue</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 shadow-sm">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {plans.reduce((sum, plan) => sum + (plan.price * (plan.memberCount || 0)), 0).toLocaleString()}
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold tracking-normal">Estimated total</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={cn(
              "bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm transition-all duration-700 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-navy-950/50 hover:-translate-y-2 group rounded-[3rem] overflow-hidden flex flex-col h-full",
              !plan.isActive && "opacity-80 grayscale-[0.5]"
            )}
          >
            <CardHeader className="p-8 pb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Badge className={cn(
                  "font-bold text-[11px] uppercase tracking-widest rounded-lg border shadow-none px-2",
                  plan.isActive
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                    : "bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-navy-400 border-slate-200 dark:border-navy-800"
                )}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="space-y-4">
                <div className={cn(
                  "w-16 h-16 rounded-[1.5rem] bg-gradient-to-br flex items-center justify-center shadow-inner transition-transform group-hover:rotate-6",
                  planColors[plan.name] || plan.color
                )}>
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-normal">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-navy-400 font-medium mt-2 line-clamp-2 min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8 flex-1 flex flex-col justify-between">
              <div className="space-y-8">
                {/* Price */}
                <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-navy-950/50 border border-slate-100 dark:border-navy-800 transition-colors">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-normal leading-none uppercase">LKR </span>
                    <span className="text-5xl font-bold text-slate-900 dark:text-white tracking-normal leading-none">{plan.price.toLocaleString()}</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 ml-1">/{plan.duration}{plan.durationType?.[0]}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                    <Users className="h-3 w-3" />
                    <span>{(plan.memberCount || 0).toLocaleString()} Subscribers</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-navy-600">Features</p>
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 group/feature">
                        <div className="mt-1 p-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-colors group-hover/feature:bg-indigo-600 group-hover/feature:text-white">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-navy-400 group-hover/feature:text-slate-900 dark:group-hover:text-white transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-8 border-t border-slate-50 dark:border-navy-800 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={() => togglePlanStatus(plan.id, plan.isActive)}
                      className="data-[state=checked]:bg-indigo-600 scale-90"
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">
                      Status
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(plan)}
                      className="h-9 w-9 text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-navy-800 rounded-xl transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(plan.id)}
                      className="h-9 w-9 text-slate-400 dark:text-navy-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Ghost Card for Add */}
        <button
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
          className="group border-4 border-dashed border-slate-100 dark:border-navy-800 rounded-[3rem] hover:border-indigo-500/20 dark:hover:border-indigo-500/40 hover:bg-slate-50/50 dark:hover:bg-navy-900/40 transition-all duration-500 flex flex-col items-center justify-center p-12 space-y-4 min-h-[500px]"
        >
          <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-navy-950 text-slate-300 dark:text-navy-700 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/20">
            <Plus className="h-10 w-10" />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-xl uppercase tracking-normal text-slate-400 dark:text-navy-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Add Plan</h4>
            <p className="text-xs font-bold text-slate-300 dark:text-navy-600 group-hover:text-slate-500 dark:group-hover:text-navy-400 transition-colors mt-1">Create a new membership plan</p>
          </div>
        </button>
      </div>
    </div>
  );
}
