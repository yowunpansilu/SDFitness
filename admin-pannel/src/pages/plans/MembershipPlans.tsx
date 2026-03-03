import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, Check, Loader2 } from 'lucide-react';
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
import api from '@/lib/api/axios';

interface MembershipPlan {
    _id: string;
    name: string;
    price: number;
    durationDays: number;
    features: string[];
    isActive: boolean;
    createdAt?: string;
}

interface PlanDisplay extends MembershipPlan {
    description: string;
    color: string;
}

const planColors: Record<string, string> = {
    'Basic': 'from-blue-500 to-cyan-600',
    'Pro': 'from-purple-500 to-pink-600',
    'Elite': 'from-amber-500 to-orange-600',
    'Student': 'from-green-500 to-emerald-600',
};

const planDescriptions: Record<string, string> = {
    'Basic': 'Perfect for beginners starting their fitness journey',
    'Pro': 'Most popular plan with full gym access and classes',
    'Elite': 'Ultimate fitness experience with exclusive benefits',
    'Student': 'Special discount for students with valid ID',
};

export function MembershipPlans() {
    const [plans, setPlans] = useState<PlanDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingPlan, setEditingPlan] = useState<PlanDisplay | null>(null);

    // Form state
    const [formName, setFormName] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formFeatures, setFormFeatures] = useState('');
    const [formDescription, setFormDescription] = useState('');

    // Fetch plans from API
    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await api.get('/membership/plans');
            const data: MembershipPlan[] = response.data;
            setPlans(data.map(plan => ({
                ...plan,
                description: planDescriptions[plan.name] || 'Membership plan',
                color: planColors[plan.name] || 'from-gray-500 to-gray-600',
            })));
        } catch (err) {
            console.error('Failed to fetch plans:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    const togglePlanStatus = async (planId: string) => {
        const plan = plans.find(p => p._id === planId);
        if (!plan) return;
        try {
            await api.put(`/membership/plans/${planId}`, { isActive: !plan.isActive });
            setPlans(plans.map(p => p._id === planId ? { ...p, isActive: !p.isActive } : p));
        } catch (err) {
            console.error('Failed to toggle plan status:', err);
        }
    };

    const handleEdit = (plan: PlanDisplay) => {
        setEditingPlan(plan);
        setFormName(plan.name);
        setFormPrice(plan.price.toString());
        setFormFeatures(plan.features.join('\n'));
        setFormDescription(plan.description);
        setOpenDialog(true);
    };

    const handleDelete = async (planId: string) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            try {
                await api.delete(`/membership/plans/${planId}`);
                setPlans(plans.filter(p => p._id !== planId));
            } catch (err) {
                console.error('Failed to delete plan:', err);
            }
        }
    };

    const handleSave = async () => {
        const planData = {
            name: formName,
            price: Number(formPrice),
            durationDays: 30,
            features: formFeatures.split('\n').filter(f => f.trim()),
            isActive: true,
        };

        try {
            if (editingPlan) {
                await api.put(`/membership/plans/${editingPlan._id}`, planData);
            } else {
                await api.post('/membership/plans', planData);
            }
            setOpenDialog(false);
            setEditingPlan(null);
            setFormName(''); setFormPrice(''); setFormFeatures(''); setFormDescription('');
            fetchPlans(); // Refresh from DB
        } catch (err) {
            console.error('Failed to save plan:', err);
        }
    };

    const handleNewPlan = () => {
        setEditingPlan(null);
        setFormName(''); setFormPrice(''); setFormFeatures(''); setFormDescription('');
        setOpenDialog(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span className="ml-3 text-gray-400">Loading plans...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Membership Plans
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage pricing plans and membership offerings
                    </p>
                </div>
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={handleNewPlan}
                            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-dark-900 border-dark-700 text-white max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                {editingPlan ? 'Update the membership plan details' : 'Add a new membership plan for your gym'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-300">Plan Name</Label>
                                    <Input
                                        id="name"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        placeholder="Premium"
                                        className="bg-dark-800/50 border-dark-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-gray-300">Price in LKR (per month)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formPrice}
                                        onChange={(e) => setFormPrice(e.target.value)}
                                        placeholder="8500"
                                        className="bg-dark-800/50 border-dark-700 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-300">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Enter plan description..."
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="features" className="text-gray-300">Features (one per line)</Label>
                                <Textarea
                                    id="features"
                                    value={formFeatures}
                                    onChange={(e) => setFormFeatures(e.target.value)}
                                    placeholder={"Gym Access\nPersonal Trainer\nNutrition Plan"}
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                    rows={5}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setOpenDialog(false)}
                                className="border-dark-700 text-gray-400 hover:text-white hover:bg-dark-800"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                            >
                                {editingPlan ? 'Update Plan' : 'Create Plan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{plans.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active Plans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {plans.filter(p => p.isActive).length}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Price Range (LKR)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {plans.length > 0 ? `${Math.min(...plans.map(p => p.price)).toLocaleString()} - ${Math.max(...plans.map(p => p.price)).toLocaleString()}` : '0'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card
                        key={plan._id}
                        className={cn(
                            "bg-dark-900/50 border-dark-800 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group",
                            !plan.isActive && "opacity-60"
                        )}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                                            plan.color
                                        )}>
                                            <DollarSign className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-white">{plan.name}</CardTitle>
                                            <Badge className={cn(
                                                "mt-1",
                                                plan.isActive
                                                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                    : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                            )}>
                                                {plan.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardDescription className="text-gray-400 mt-2">
                                        {plan.description}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Price */}
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">LKR {plan.price.toLocaleString()}</span>
                                <span className="text-gray-400">/{plan.durationDays} days</span>
                            </div>

                            {/* Features */}
                            <div className="space-y-2 pt-4 border-t border-dark-700">
                                <p className="text-sm font-semibold text-gray-300 mb-3">Features:</p>
                                <div className="space-y-2">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-400">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={plan.isActive}
                                        onCheckedChange={() => togglePlanStatus(plan._id)}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                    <span className="text-sm text-gray-400">
                                        {plan.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleEdit(plan)}
                                        className="text-gray-400 hover:text-white hover:bg-dark-800"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(plan._id)}
                                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
