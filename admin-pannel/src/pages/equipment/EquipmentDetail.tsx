import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, MapPin, Package, Wrench, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import api from '@/lib/api/axios';

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    working: { label: 'Working', color: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30', icon: '✅' },
    maintenance: { label: 'Maintenance', color: 'bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30', icon: '🔧' },
    broken: { label: 'Broken', color: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30', icon: '❌' },
    retired: { label: 'Retired', color: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30', icon: '🚫' },
};

const categoryColors: Record<string, string> = {
    cardio: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
    strength: 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
    free_weights: 'bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
    functional: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30',
    other: 'bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
};

export function EquipmentDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [equipment, setEquipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const res = await api.get(`/equipment/${id}`);
                setEquipment(res.data);
            } catch {
                setEquipment(null);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Equipment not found</p>
                <Button onClick={() => navigate('/equipment')} className="mt-4">Back to Equipment</Button>
            </div>
        );
    }

    const status = equipment.status || 'working';
    const statusInfo = statusConfig[status] || statusConfig.working;
    const category = equipment.category || 'other';
    const maintenanceHistory = equipment.maintenanceHistory || [];
    const totalMaintenanceCost = maintenanceHistory.reduce((sum: number, item: any) => sum + (item.cost || 0), 0);

    const daysUntilMaintenance = equipment.nextMaintenanceDate
        ? Math.ceil((new Date(equipment.nextMaintenanceDate).getTime() - Date.now()) / 86400000)
        : null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/equipment')} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {equipment.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Equipment Details & Maintenance History</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => navigate(`/equipment/edit/${id}`)} className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30">
                        <Edit className="h-4 w-4 mr-2" /> Edit Equipment
                    </Button>
                    <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/20">
                        <Trash2 className="h-4 w-4 mr-2" /> Retire
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</CardTitle></CardHeader>
                    <CardContent>
                        <Badge className={cn('text-base', statusInfo.color)}>{statusInfo.icon} {statusInfo.label}</Badge>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Maintenance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {daysUntilMaintenance !== null ? (
                                <span className={cn(daysUntilMaintenance < 7 ? 'text-yellow-600 dark:text-yellow-400' : '')}>{daysUntilMaintenance} days</span>
                            ) : 'Not scheduled'}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Maintenance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">LKR {totalMaintenanceCost.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">{maintenanceHistory.length} services</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchase Price</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">LKR {(equipment.purchasePrice || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-gray-900 dark:text-white flex items-center gap-2"><Package className="h-5 w-5" /> Equipment Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Category</label>
                                    <div className="mt-1"><Badge className={cn(categoryColors[category] || categoryColors.other)}>{category.replace('_', ' ')}</Badge></div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2"><MapPin className="h-4 w-4" /> Location</label>
                                    <p className="text-gray-900 dark:text-white mt-1">{equipment.location || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Brand & Model</label>
                                    <p className="text-gray-900 dark:text-white mt-1">{equipment.brand || '—'} {equipment.model || ''}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Serial Number</label>
                                    <p className="text-gray-900 dark:text-white mt-1 font-mono text-sm">{equipment.serialNumber || '—'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Purchase Date</label>
                                    <p className="text-gray-900 dark:text-white mt-1">{equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : '—'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-gray-400">Warranty Expiry</label>
                                    <p className="text-gray-900 dark:text-white mt-1">{equipment.warrantyExpiry ? new Date(equipment.warrantyExpiry).toLocaleDateString() : '—'}</p>
                                </div>
                            </div>
                            {equipment.notes && (
                                <div><label className="text-sm text-gray-500 dark:text-gray-400">Notes</label><p className="text-gray-900 dark:text-white mt-1">{equipment.notes}</p></div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-gray-900 dark:text-white flex items-center gap-2"><Wrench className="h-5 w-5" /> Maintenance History</CardTitle></CardHeader>
                        <CardContent>
                            {maintenanceHistory.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-6">No maintenance records yet</p>
                            ) : (
                                <div className="space-y-4">
                                    {maintenanceHistory.map((record: any, i: number) => (
                                        <div key={record._id || i} className="p-4 rounded-lg bg-gray-50 dark:bg-dark-800/50 border border-gray-200 dark:border-dark-700">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="text-gray-900 dark:text-white font-semibold">{record.type || 'Service'}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {record.date ? new Date(record.date).toLocaleDateString() : '—'}
                                                    </p>
                                                </div>
                                                <Badge className="bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30">
                                                    LKR {(record.cost || 0).toLocaleString()}
                                                </Badge>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{record.description || '—'}</p>
                                            {record.technician && <p className="text-xs text-gray-500">Technician: {record.technician}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-gray-900 dark:text-white text-base">Maintenance Schedule</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Last Maintenance</label>
                                <p className="text-gray-900 dark:text-white">{equipment.lastMaintenanceDate ? new Date(equipment.lastMaintenanceDate).toLocaleDateString() : 'None'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 dark:text-gray-400">Next Maintenance</label>
                                <p className={cn('text-gray-900 dark:text-white', daysUntilMaintenance && daysUntilMaintenance < 7 ? 'text-yellow-600 dark:text-yellow-400 font-semibold' : '')}>
                                    {equipment.nextMaintenanceDate ? new Date(equipment.nextMaintenanceDate).toLocaleDateString() : 'Not scheduled'}
                                </p>
                                {daysUntilMaintenance && daysUntilMaintenance < 7 && (
                                    <div className="flex items-center gap-2 mt-2 text-yellow-600 dark:text-yellow-400 text-sm">
                                        <AlertTriangle className="h-4 w-4" /><span>Due soon!</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm">
                        <CardHeader><CardTitle className="text-gray-900 dark:text-white text-base">Quick Actions</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                                <Wrench className="h-4 w-4 mr-2" /> Schedule Maintenance
                            </Button>
                            <Button variant="outline" className="w-full border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800">Record Service</Button>
                            <Button variant="outline" className="w-full border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800">Generate Report</Button>
                            <Button variant="outline" className="w-full border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-800">Change Location</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
