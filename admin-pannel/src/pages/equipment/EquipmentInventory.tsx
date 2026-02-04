import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, XCircle, Calendar } from 'lucide-react';
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

interface Equipment {
    id: string;
    name: string;
    category: 'cardio' | 'strength' | 'free_weights' | 'functional' | 'other';
    brand: string;
    model: string;
    serialNumber: string;
    purchaseDate: string;
    lastMaintenance?: string;
    nextMaintenance?: string;
    status: 'working' | 'maintenance' | 'broken' | 'retired';
    location: string;
    notes?: string;
}

// Mock data
const mockEquipment: Equipment[] = [
    {
        id: '1',
        name: 'Treadmill Pro X5',
        category: 'cardio',
        brand: 'RunMaster',
        model: 'X5-2024',
        serialNumber: 'RM-TM-001234',
        purchaseDate: '2023-06-15',
        lastMaintenance: '2024-01-15',
        nextMaintenance: '2024-04-15',
        status: 'working',
        location: 'Cardio Zone A',
    },
    {
        id: '2',
        name: 'Leg Press Machine',
        category: 'strength',
        brand: 'IronFlex',
        model: 'LP-900',
        serialNumber: 'IF-LP-005678',
        purchaseDate: '2022-03-20',
        lastMaintenance: '2024-01-20',
        nextMaintenance: '2024-04-20',
        status: 'working',
        location: 'Strength Zone B',
    },
    {
        id: '3',
        name: 'Rowing Machine Elite',
        category: 'cardio',
        brand: 'RowPro',
        model: 'Elite-500',
        serialNumber: 'RP-ROW-009876',
        purchaseDate: '2023-09-10',
        lastMaintenance: '2024-02-01',
        nextMaintenance: '2024-05-01',
        status: 'maintenance',
        location: 'Cardio Zone B',
        notes: 'Belt replacement needed',
    },
    {
        id: '4',
        name: 'Smith Machine Deluxe',
        category: 'strength',
        brand: 'PowerLift',
        model: 'SM-Deluxe',
        serialNumber: 'PL-SM-112233',
        purchaseDate: '2021-11-05',
        lastMaintenance: '2024-01-10',
        nextMaintenance: '2024-04-10',
        status: 'working',
        location: 'Free Weights Area',
    },
    {
        id: '5',
        name: 'Exercise Bike Pro',
        category: 'cardio',
        brand: 'CycleFit',
        model: 'Pro-200',
        serialNumber: 'CF-EB-445566',
        purchaseDate: '2023-04-12',
        lastMaintenance: '2023-12-20',
        nextMaintenance: '2024-03-20',
        status: 'broken',
        location: 'Spin Room',
        notes: 'Resistance motor failure - awaiting parts',
    },
    {
        id: '6',
        name: 'Cable Crossover Station',
        category: 'strength',
        brand: 'IronFlex',
        model: 'CCS-Pro',
        serialNumber: 'IF-CCS-778899',
        purchaseDate: '2022-08-15',
        lastMaintenance: '2024-01-25',
        nextMaintenance: '2024-04-25',
        status: 'working',
        location: 'Functional Zone',
    },
];

const statusConfig = {
    working: {
        label: 'Working',
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: CheckCircle,
    },
    maintenance: {
        label: 'Maintenance',
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: Wrench,
    },
    broken: {
        label: 'Broken',
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: XCircle,
    },
    retired: {
        label: 'Retired',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: AlertTriangle,
    },
};

const categoryLabels = {
    cardio: 'Cardio',
    strength: 'Strength',
    free_weights: 'Free Weights',
    functional: 'Functional',
    other: 'Other',
};

export function EquipmentInventory() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredEquipment = mockEquipment.filter((equipment) => {
        const matchesSearch =
            equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            equipment.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            equipment.brand.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || equipment.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || equipment.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    const workingCount = mockEquipment.filter(e => e.status === 'working').length;
    const maintenanceCount = mockEquipment.filter(e => e.status === 'maintenance').length;
    const brokenCount = mockEquipment.filter(e => e.status === 'broken').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Equipment Inventory
                    </h1>
                    <p className="text-gray-400 mt-2">
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
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Total Equipment</CardTitle>
                            <CheckCircle className="h-4 w-4 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{mockEquipment.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Working</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{workingCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">In Maintenance</CardTitle>
                            <Wrench className="h-4 w-4 text-yellow-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{maintenanceCount}</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Broken</CardTitle>
                            <XCircle className="h-4 w-4 text-red-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{brokenCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search equipment..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-dark-800/50 border-dark-700 text-white placeholder:text-gray-500"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-dark-800/50 border-dark-700 text-white">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-900 border-dark-700">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="working">Working</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="broken">Broken</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-dark-800/50 border-dark-700 text-white">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-900 border-dark-700">
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
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">Equipment List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-dark-700 hover:bg-transparent">
                                <TableHead className="text-gray-400">Equipment</TableHead>
                                <TableHead className="text-gray-400">Category</TableHead>
                                <TableHead className="text-gray-400">Serial Number</TableHead>
                                <TableHead className="text-gray-400">Location</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-gray-400">Next Maintenance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEquipment.map((equipment) => {
                                const StatusIcon = statusConfig[equipment.status].icon;
                                const isMaintenanceDue = equipment.nextMaintenance &&
                                    new Date(equipment.nextMaintenance) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                                return (
                                    <TableRow
                                        key={equipment.id}
                                        onClick={() => navigate(`/equipment/${equipment.id}`)}
                                        className="border-dark-700 hover:bg-dark-800/50 cursor-pointer"
                                    >
                                        <TableCell>
                                            <div>
                                                <p className="text-white font-medium">{equipment.name}</p>
                                                <p className="text-sm text-gray-500">{equipment.brand} - {equipment.model}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                                {categoryLabels[equipment.category]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-gray-400">
                                            {equipment.serialNumber}
                                        </TableCell>
                                        <TableCell className="text-gray-400">{equipment.location}</TableCell>
                                        <TableCell>
                                            <Badge className={cn(statusConfig[equipment.status].color, 'flex items-center gap-1 w-fit')}>
                                                <StatusIcon className="h-3 w-3" />
                                                {statusConfig[equipment.status].label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {equipment.nextMaintenance ? (
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className={cn(
                                                        "text-sm",
                                                        isMaintenanceDue ? "text-yellow-400 font-semibold" : "text-gray-400"
                                                    )}>
                                                        {new Date(equipment.nextMaintenance).toLocaleDateString()}
                                                    </span>
                                                    {isMaintenanceDue && (
                                                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                                            Due Soon
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-sm">Not scheduled</span>
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
