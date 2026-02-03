import { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Clock, Users, Check, X } from 'lucide-react';
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
                        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20">
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
                                        placeholder="Premium"
                                        className="bg-dark-800/50 border-dark-700 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-gray-300">Price (per month)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="99"
                                        className="bg-dark-800/50 border-dark-700 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-gray-300">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter plan description..."
                                    className="bg-dark-800/50 border-dark-700 text-white"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="features" className="text-gray-300">Features (one per line)</Label>
                                <Textarea
                                    id="features"
                                    placeholder="Gym Access&#10;Personal Trainer&#10;Nutrition Plan"
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
                            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                                {editingPlan ? 'Update Plan' : 'Create Plan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        <CardTitle className="text-sm font-medium text-gray-400">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            {plans.reduce((sum, plan) => sum + plan.memberCount, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Monthly Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">
                            ${plans.reduce((sum, plan) => sum + (plan.price * plan.memberCount), 0).toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card
                        key={plan.id}
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
                                <span className="text-4xl font-bold text-white">${plan.price}</span>
                                <span className="text-gray-400">/{plan.duration} {plan.durationType}</span>
                            </div>

                            {/* Member Count */}
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                <Users className="h-4 w-4" />
                                <span>{plan.memberCount} active members</span>
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
                                        onCheckedChange={() => togglePlanStatus(plan.id)}
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
                                        onClick={() => handleDelete(plan.id)}
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
