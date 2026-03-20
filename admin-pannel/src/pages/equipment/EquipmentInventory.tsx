import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, XCircle, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

interface Equipment {
    _id: string;
    name: string;
    category: string;
    status: 'active' | 'maintenance' | 'retired';
    purchaseDate?: string;
    lastMaintenance?: string;
    nextMaintenance?: string;
}



const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    active: {
        label: 'Active',
        color: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30',
        icon: CheckCircle,
    },
    maintenance: {
        label: 'Maintenance',
        color: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
        icon: Wrench,
    },
    retired: {
        label: 'Retired',
        color: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
        icon: AlertTriangle,
    },
};

const categoryLabels: Record<string, string> = {
    'Cardio': 'Cardio',
    'Strength': 'Strength',
    'Free Weights': 'Free Weights',
    'Functional': 'Functional',
};

export function EquipmentInventory() {
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const response = await api.get('/equipment');
                setEquipment(response.data);
            } catch (err) {
                console.error('Failed to fetch equipment:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    const filteredEquipment = equipment.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const activeCount = equipment.filter(e => e.status === 'active').length;
    const maintenanceCount = equipment.filter(e => e.status === 'maintenance').length;
    const retiredCount = equipment.filter(e => e.status === 'retired').length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Equipment Inventory
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Manage gym equipment and maintenance schedules
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/equipment/add')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Equipment</CardTitle>
                            <CheckCircle className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{equipment.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Working</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">In Maintenance</CardTitle>
                            <Wrench className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{maintenanceCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Retired</CardTitle>
                            <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{retiredCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search equipment..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white placeholder:text-gray-500"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="working">Working</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="broken">Broken</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-white dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="cardio">Cardio</SelectItem>
                                <SelectItem value="strength">Strength</SelectItem>
                                <SelectItem value="free_weights">Free Weights</SelectItem>
                                <SelectItem value="functional">Functional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Equipment Table */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Equipment List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-200 dark:border-dark-700 hover:bg-transparent">
                                <TableHead className="text-gray-500 dark:text-gray-400">Equipment</TableHead>
                                <TableHead className="text-gray-500 dark:text-gray-400">Category</TableHead>
                                <TableHead className="text-gray-500 dark:text-gray-400">Serial Number</TableHead>
                                <TableHead className="text-gray-500 dark:text-gray-400">Location</TableHead>
                                <TableHead className="text-gray-500 dark:text-gray-400">Status</TableHead>
                                <TableHead className="text-gray-500 dark:text-gray-400">Next Maintenance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEquipment.map((item) => {
                                const cfg = statusConfig[item.status] || statusConfig['active'];
                                const StatusIcon = cfg.icon;
                                const isMaintenanceDue = item.nextMaintenance &&
                                    new Date(item.nextMaintenance) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                                return (
                                    <TableRow
                                        key={item._id}
                                        onClick={() => navigate(`/equipment/${item._id}`)}
                                        className="border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-800/50 cursor-pointer"
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="text-gray-900 dark:text-white font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30">
                                                {categoryLabels[item.category] || item.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-gray-500 dark:text-gray-400">
                                            {item._id.slice(-8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-400">{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '-'}</TableCell>
                                        <TableCell>
                                            <Badge className={cn(cfg.color, 'flex items-center gap-1 w-fit')}>
                                                <StatusIcon className="h-3 w-3" />
                                                {cfg.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.nextMaintenance ? (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className={cn(
                                                        "text-sm",
                                                        isMaintenanceDue ? "text-yellow-600 dark:text-yellow-400 font-semibold" : "text-gray-500 dark:text-gray-400"
                                                    )}>
                                                        {new Date(item.nextMaintenance).toLocaleDateString()}
                                                    </span>
                                                    {isMaintenanceDue && (
                                                        <Badge className="bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30 text-xs">
                                                            Due Soon
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-600 text-sm">Not scheduled</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>

                    {filteredEquipment.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">No equipment found matching your criteria</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
