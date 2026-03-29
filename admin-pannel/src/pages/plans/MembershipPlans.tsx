import { useState, useEffect } from 'react';
import { Plus, Check, Edit2, Trash2, Loader2, Clock, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { membershipService } from '@/services/membershipService';
import { useToast } from '@/hooks/use-toast';

interface MembershipPlan {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
  isActive: boolean;
  type: 'basic' | 'standard' | 'premium';
}

const planTypeStyles = {
  basic: 'from-white to-slate-50 border-slate-300 text-slate-700',
  standard: 'from-indigo-50 to-white border-indigo-500/30 text-indigo-600',
  premium: 'from-amber-50 to-white border-amber-500/30 text-amber-600',
};

export function MembershipPlans() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await membershipService.getPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: 'Network Error',
        description: 'Failed to access membership protocol matrix.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Confirm irreversible termination of ${name} plan?`)) return;
    try {
      await membershipService.deletePlan(id);
      toast({ title: 'Protocol Terminated', description: `${name} has been purged from records.` });
      setPlans(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      toast({ title: 'Execution Failed', description: 'Could not delete membership plan.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Parsing Subscription Layers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Access <span className="text-indigo-600 italic font-medium">Subscription Tiers</span>
          </h1>
          <p className="text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Configure matrix entry protocols and pricing
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-900/20 h-11 px-6 font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 border border-slate-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Define New Tier
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan._id}
            className={cn(
              "relative bg-gradient-to-br border-2 shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden group hover:-translate-y-2",
              planTypeStyles[plan.type || 'basic']
            )}
          >
            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              <Badge className={cn(
                "font-black text-[9px] uppercase tracking-widest px-3 py-1 border-none shadow-none rounded-lg",
                plan.isActive ? "bg-emerald-500/20 text-emerald-600" : "bg-rose-500/20 text-rose-600"
              )}>
                {plan.isActive ? 'ACTIVE_PROTOCOL' : 'SUSPENDED'}
              </Badge>
            </div>

            <CardHeader className="pt-10 pb-6 px-10">
              <CardTitle className="text-3xl font-black text-slate-900 hover:text-indigo-600 transition-colors uppercase tracking-tighter">
                {plan.name}
              </CardTitle>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-tighter text-slate-900">LKR {plan.price.toLocaleString()}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">/ {plan.duration} DAYS</span>
              </div>
            </CardHeader>

            <CardContent className="px-10 pb-10 space-y-8">
              <p className="text-xs font-bold text-slate-600 leading-relaxed uppercase tracking-wider italic">
                {plan.description}
              </p>

              {/* Features List */}
              <div className="space-y-4">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-800">Enabled Features</p>
                <div className="grid gap-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 group/item">
                      <div className="h-5 w-5 rounded-lg bg-slate-50 flex items-center justify-center p-1 border border-slate-300 transition-colors group-hover/item:border-indigo-500/50">
                        <Check className="h-3 w-3 text-indigo-600" />
                      </div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover/item:text-slate-900 transition-colors">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-300">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-50/50">
                    <Users className="h-3.5 w-3.5 text-slate-700" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-900 uppercase">Members</p>
                    <p className="text-xs font-black text-slate-900">LIVE_SYST</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-50/50">
                    <Shield className="h-3.5 w-3.5 text-slate-700" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-900 uppercase">Access</p>
                    <p className="text-xs font-black text-slate-900 uppercase">{plan.type}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                <Button variant="outline" className="flex-1 rounded-2xl border-slate-300 bg-slate-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest h-12 hover:bg-slate-100 hover:text-slate-900 border-2">
                  <Edit2 className="h-3 w-3 mr-2" /> Configure
                </Button>
                <Button 
                   onClick={() => handleDelete(plan._id, plan.name)}
                   variant="outline" 
                   className="rounded-2xl border-rose-900/40 bg-rose-950/10 text-rose-500 font-black text-[10px] uppercase tracking-widest h-12 w-12 p-0 hover:bg-rose-500 hover:text-white border-2 transition-all active:scale-95"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-300">
          <Clock className="h-10 w-10 text-slate-900 mx-auto mb-6" />
          <h3 className="text-slate-900 font-black text-xl uppercase tracking-widest">Protocol Matrix Empty</h3>
          <p className="text-slate-700 font-bold text-xs uppercase tracking-widest mt-2">Begin definition of access tiers</p>
        </div>
      )}
    </div>
  );
}
