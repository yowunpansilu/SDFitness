import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Wrench,
    MapPin,
    Calendar,
    DollarSign,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Barcode,
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceRecord {
    id: string;
    date: string;
    type: 'routine' | 'repair' | 'inspection';
    description: string;
    cost: number;
    technician: string;
    status: 'completed' | 'pending' | 'scheduled';
}

interface EquipmentData {
    id: string;
    name: string;
    brand: string;
    model: string;
    category: string;
    status: 'available' | 'in-use' | 'maintenance' | 'broken';
    location: string;
    purchaseDate: string;
    purchasePrice: number;
    warrantyExpiry: string;
    serialNumber: string;
    condition: number; // 0-100
    usageHours: number;
    lastMaintenance: string;
    nextMaintenance: string;
    maintenanceRecords: MaintenanceRecord[];
    specifications?: Record<string, string>;
    notes?: string;
}

// Mock data
const MOCK_EQUIPMENT: EquipmentData = {
    id: '1',
    name: 'Treadmill Pro X3000',
    brand: 'FitTech',
    model: 'X3000-PRO',
    category: 'Cardio',
    status: 'available',
    location: 'Cardio Zone - Row 2',
    purchaseDate: '2025-06-15',
    purchasePrice: 3500,
    warrantyExpiry: '2028-06-15',
    serialNumber: 'FT-X3000-2025-1234',
    condition: 85,
    usageHours: 1240,
    lastMaintenance: '2026-01-15',
    nextMaintenance: '2026-04-15',
    maintenanceRecords: [
        {
            id: '1',
            date: '2026-01-15',
            type: 'routine',
            description: 'Belt lubrication and general inspection',
            cost: 75,
            technician: 'Mike Johnson',
            status: 'completed',
        },
        {
            id: '2',
            date: '2025-10-10',
            type: 'repair',
            description: 'Replaced motor controller board',
            cost: 350,
            technician: 'Sarah Lee',
            status: 'completed',
        },
    ],
    specifications: {
        'Max Speed': '12 mph',
        'Max Incline': '15%',
        'Running Surface': '20" x 60"',
        'Weight Capacity': '350 lbs',
        'Motor Power': '4.0 HP',
    },
    notes: 'High-performance treadmill for intensive cardio workouts',
};

const STATUS_CONFIG = {
    available: {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: CheckCircle2,
        label: 'Available',
    },
    'in-use': {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: Clock,
        label: 'In Use',
    },
    maintenance: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: Wrench,
        label: 'Maintenance',
    },
    broken: {
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: AlertTriangle,
        label: 'Broken',
    },
};

const MAINTENANCE_TYPE_CONFIG = {
    routine: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Routine' },
    repair: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Repair' },
    inspection: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Inspection' },
};

export function EquipmentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [equipmentData] = useState<EquipmentData>(MOCK_EQUIPMENT);

    const handleEdit = () => {
        navigate(`/admin/equipment/${id}/edit`);
    };

    const handleScheduleMaintenance = () => {
        toast({
            title: 'Maintenance Scheduled',
            description: 'A new maintenance appointment has been created',
        });
    };

    const handleDelete = () => {
        toast({
            title: 'Equipment Deleted',
            description: 'The equipment has been removed from inventory',
            variant: 'destructive',
        });
        navigate('/admin/equipment');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getConditionColor = (condition: number) => {
        if (condition >= 80) return 'bg-green-500';
        if (condition >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const isWarrantyActive = new Date(equipmentData.warrantyExpiry) > new Date();
    const StatusIcon = STATUS_CONFIG[equipmentData.status].icon;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/equipment')}
                        className="text-muted-foreground hover:text-foreground hover:bg-card"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{equipmentData.name}</h1>
                        <p className="text-muted-foreground">
                            {equipmentData.brand} {equipmentData.model}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleScheduleMaintenance}
                        className="bg-card border-border text-muted-foreground hover:bg-muted"
                    >
                        <Wrench className="h-4 w-4 mr-2" />
                        Schedule Maintenance
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleEdit}
                        className="bg-card border-border text-muted-foreground hover:bg-muted"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        className="bg-card border-border text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Hero Card */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/30">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={STATUS_CONFIG[equipmentData.status].color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {STATUS_CONFIG[equipmentData.status].label}
                                </Badge>
                                <Badge variant="outline" className="bg-card text-muted-foreground border-border">
                                    {equipmentData.category}
                                </Badge>
                                {isWarrantyActive && (
                                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                        Under Warranty
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Location</div>
                                        <div className="text-foreground font-semibold">{equipmentData.location}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Usage Hours</div>
                                        <div className="text-foreground font-semibold">{equipmentData.usageHours}h</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Next Maintenance</div>
                                        <div className="text-foreground font-semibold">
                                            {formatDate(equipmentData.nextMaintenance)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-blue-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Purchase Price</div>
                                        <div className="text-foreground font-semibold">
                                            {formatCurrency(equipmentData.purchasePrice)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Equipment Condition</span>
                                    <span className="text-sm font-semibold text-foreground">{equipmentData.condition}%</span>
                                </div>
                                <Progress
                                    value={equipmentData.condition}
                                    className={`h-2 ${getConditionColor(equipmentData.condition)}`}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Equipment Details */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <Barcode className="h-5 w-5 text-purple-400" />
                            Equipment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="text-sm text-muted-foreground">Serial Number</div>
                            <div className="text-foreground font-mono text-sm">{equipmentData.serialNumber}</div>
                        </div>
                        <Separator className="bg-muted" />
                        <div>
                            <div className="text-sm text-muted-foreground">Purchase Date</div>
                            <div className="text-foreground">{formatDate(equipmentData.purchaseDate)}</div>
                        </div>
                        <Separator className="bg-muted" />
                        <div>
                            <div className="text-sm text-muted-foreground">Warranty Expires</div>
                            <div className="text-foreground">{formatDate(equipmentData.warrantyExpiry)}</div>
                        </div>
                        <Separator className="bg-muted" />
                        <div>
                            <div className="text-sm text-muted-foreground">Last Maintenance</div>
                            <div className="text-foreground">{formatDate(equipmentData.lastMaintenance)}</div>
                        </div>
                    </CardContent>
                </Card>

                {/* Specifications */}
                <Card className="bg-background/50 border-border lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-foreground">Technical Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {equipmentData.specifications ? (
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(equipmentData.specifications).map(([key, value]) => (
                                    <div key={key} className="space-y-1">
                                        <div className="text-sm text-muted-foreground">{key}</div>
                                        <div className="text-foreground font-medium">{value}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No specifications available</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Maintenance History */}
            <Card className="bg-background/50 border-border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-foreground">Maintenance History</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                View all maintenance and repair records
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-card border-border text-muted-foreground hover:bg-muted"
                            onClick={handleScheduleMaintenance}
                        >
                            Add Record
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {equipmentData.maintenanceRecords.map((record) => (
                            <div
                                key={record.id}
                                className="flex items-start gap-4 p-4 rounded-lg bg-card/50 hover:bg-card transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-purple-500/20">
                                    <Wrench className="h-5 w-5 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-foreground">{record.description}</span>
                                        <Badge
                                            variant="outline"
                                            className={MAINTENANCE_TYPE_CONFIG[record.type].color}
                                        >
                                            {MAINTENANCE_TYPE_CONFIG[record.type].label}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatDate(record.date)} • Technician: {record.technician}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                        Cost: {formatCurrency(record.cost)}
                                    </div>
                                </div>
                                <div>
                                    {record.status === 'completed' && (
                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Notes */}
            {equipmentData.notes && (
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{equipmentData.notes}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
