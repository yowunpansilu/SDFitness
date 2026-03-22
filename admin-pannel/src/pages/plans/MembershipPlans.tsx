import { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Users, Check } from 'lucide-react';
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

// Mock data
const mockPlans: MembershipPlan[] = [
    {
        id: '1',
        name: 'Basic',
        description: 'Perfect for beginners starting their fitness journey',
        price: 49,
        duration: 1,
        durationType: 'months',
        features: ['Gym Access', 'Locker Room', 'Basic Equipment'],
        isActive: true,
        memberCount: 245,
        color: 'from-blue-500 to-cyan-600',
    },
    {
        id: '2',
        name: 'Premium',
        description: 'Most popular plan with full gym access and classes',
        price: 99,
        duration: 1,
        durationType: 'months',
        features: ['Gym Access', 'All Group Classes', 'Personal Trainer (2 sessions)', 'Nutrition Consultation', 'Sauna & Steam Room'],
        isActive: true,
        memberCount: 567,
        color: 'from-purple-500 to-pink-600',
    },
    {
        id: '3',
        name: 'VIP',
        description: 'Ultimate fitness experience with exclusive benefits',
        price: 149,
        duration: 1,
        durationType: 'months',
        features: ['24/7 Gym Access', 'All Group Classes', 'Personal Trainer (8 sessions)', 'Nutrition & Diet Plan', 'Sauna & Steam Room', 'Guest Passes (4/month)', 'Priority Equipment Access'],
        isActive: true,
        memberCount: 123,
        color: 'from-amber-500 to-orange-600',
    },
    {
        id: '4',
        name: 'Student',
        description: 'Special discount for students with valid ID',
        price: 39,
        duration: 1,
        durationType: 'months',
        features: ['Gym Access', 'Locker Room', 'Group Classes (select)', 'Study Area'],
        isActive: false,
        memberCount: 89,
        color: 'from-green-500 to-emerald-600',
    },
];

const planColors: Record<string, string> = {
    'Basic': 'from-slate-400 to-slate-500 dark:from-slate-700 dark:to-slate-800',
    'Premium': 'from-indigo-500 to-violet-600',
    'VIP': 'from-amber-500 to-orange-600',
    'Student': 'from-emerald-500 to-teal-600',
};

export function MembershipPlans() {
    const [plans, setPlans] = useState(mockPlans);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);

    const togglePlanStatus = (planId: string) => {
        setPlans(plans.map(plan =>
            plan.id === planId ? { ...plan, isActive: !plan.isActive } : plan
        ));
    };

    const handleEdit = (plan: MembershipPlan) => {
        setEditingPlan(plan);
        setOpenDialog(true);
    };

    const handleDelete = (planId: string) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            setPlans(plans.filter(plan => plan.id !== planId));
        }
    };

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Service <span className="text-indigo-600 italic">Architecture</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Define pricing structures, membership tiers and exclusive value propositions.
                    </p>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95">
                            <Plus className="h-4 w-4 mr-2" />
                            Draft New Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-2xl rounded-[2rem] overflow-hidden p-0 gap-0 shadow-2xl">
                        <DialogHeader className="p-8 pb-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                {editingPlan ? 'Refine Plan' : 'Architect New Plan'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium italic">
                                {editingPlan ? 'Update the structural details of this membership offering.' : 'Define the parameters for a new market offering.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="px-8 py-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</Label>
                                    <Input
                                        id="name"
                                        placeholder="Plan Name"
                                        className="h-11 bg-slate-50 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valuation ($)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="Market Price"
                                        className="h-11 bg-slate-50 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Value Proposition</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Outline the core objective of this plan..."
                                    className="bg-slate-50 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-medium min-h-[80px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="features" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inclusions (Newline Separated)</Label>
                                <Textarea
                                    id="features"
                                    placeholder="Locker access&#10;Group sessions&#10;Extended hours..."
                                    className="bg-slate-50 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-xl font-medium min-h-[120px]"
                                />
                            </div>
                        </div>
                        <DialogFooter className="p-8 pt-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="ghost"
                                onClick={() => setOpenDialog(false)}
                                className="h-11 rounded-xl font-black uppercase text-xs tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                            >
                                Discard
                            </Button>
                            <Button className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                                {editingPlan ? 'Commit Changes' : 'Initialize Plan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Tier Matrix</CardTitle>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
                            <Plus className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{plans.length}</div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Defined structures</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500">Live Plans</CardTitle>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
                            <Check className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            {plans.filter(p => p.isActive).length}
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Publicly available</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-500">User Base</CardTitle>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            {plans.reduce((sum, plan) => sum + plan.memberCount, 0).toLocaleString()}
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Total subscribers</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500">MRR projection</CardTitle>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600 transition-transform group-hover:scale-110">
                            <DollarSign className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">
                            ${plans.reduce((sum, plan) => sum + (plan.price * plan.memberCount), 0).toLocaleString()}
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider font-bold">Projected monthly</p>
                    </CardContent>
                </Card>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
                        className={cn(
                            "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm transition-all duration-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 group rounded-[3rem] overflow-hidden flex flex-col",
                            !plan.isActive && "grayscale opacity-60"
                        )}
                    >
                        <CardHeader className="p-8 pb-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <Badge className={cn(
                                    "font-black text-[9px] uppercase tracking-widest rounded-lg border shadow-none px-2",
                                    plan.isActive
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
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
                                    <CardTitle className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tighter">
                                        {plan.name}
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 font-medium italic mt-2 line-clamp-2 min-h-[40px]">
                                        {plan.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8 flex-1 flex flex-col justify-between">
                            <div className="space-y-8">
                                {/* Price */}
                                <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">${plan.price}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">/{plan.duration}{plan.durationType[0]}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                        <Users className="h-3 w-3" />
                                        <span>{plan.memberCount.toLocaleString()} Subscribers</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inclusions</p>
                                    <div className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <div key={index} className="flex items-start gap-3 group/feature">
                                                <div className="mt-1 p-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 transition-colors group-hover/feature:bg-indigo-600 group-hover/feature:text-white">
                                                    <Check className="h-2.5 w-2.5" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover/feature:text-slate-900 dark:group-hover/feature:text-white transition-colors">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={plan.isActive}
                                            onCheckedChange={() => togglePlanStatus(plan.id)}
                                            className="data-[state=checked]:bg-indigo-600 scale-90"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Status
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleEdit(plan)}
                                            className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDelete(plan.id)}
                                            className="h-9 w-9 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
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
                    onClick={() => setOpenDialog(true)}
                    className="group border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] hover:border-indigo-500/20 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-500 flex flex-col items-center justify-center p-12 space-y-4 min-h-[500px]"
                >
                    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-indigo-500/20">
                        <Plus className="h-10 w-10" />
                    </div>
                    <div className="text-center">
                        <h4 className="font-black text-xl uppercase tracking-tighter text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Architect Tier</h4>
                        <p className="text-xs font-bold text-slate-300 group-hover:text-slate-500 transition-colors mt-1 italic">Draft new membership structure</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
