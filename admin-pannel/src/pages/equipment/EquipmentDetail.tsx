import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, MapPin, Package, Wrench, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig = {
  working: {
    label: 'Working',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: '✅',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: '🔧',
  },
  broken: {
    label: 'Broken',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: '❌',
  },
  retired: {
    label: 'Retired',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: '🚫',
  },
};

const categoryColors = {
  cardio: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  strength: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  free_weights: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  functional: 'bg-green-500/20 text-green-400 border-green-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

import { useState, useEffect } from 'react';
import { equipmentService } from '@/services/equipmentService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function EquipmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [equipment, setEquipment] = useState<{
    _id?: string;
    status: string;
    category: string;
    name: string;
    serialNumber?: string;
    brand?: string;
    model?: string;
    nextMaintenance?: string;
    maintenanceHistory?: { id: string; cost: number; type: string; date: string; description: string; technician?: string }[];
    purchasePrice?: number;
    location?: string;
    purchaseDate?: string;
    warrantyExpiry?: string;
    notes?: string;
    lastMaintenance?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await equipmentService.getEquipmentById(id);
          // Map backend 'active' to frontend 'working'
          if (data.status === 'active') data.status = 'working';
          setEquipment(data);
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch equipment details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-slate-500 dark:text-navy-400 font-bold uppercase tracking-widest text-xs">Loading Asset Details...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-bold">Equipment not found.</p>
        <Button onClick={() => navigate('/equipment')} variant="link">Back to Inventory</Button>
      </div>
    );
  }

  const daysUntilMaintenance = equipment.nextMaintenance
    ? Math.ceil(
      (new Date(equipment.nextMaintenance).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    )
    : null;

  const maintenanceHistory = equipment.maintenanceHistory || [];
  const totalMaintenanceCost = maintenanceHistory.reduce((sum: number, item: { cost?: number }) => sum + (item.cost || 0), 0);

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
            <div className="flex items-center gap-3 mb-2">
              <Badge className={cn('font-bold text-xs uppercase tracking-widest rounded-lg border shadow-sm px-2 py-1', (statusConfig as Record<string, { color: string; label: string }>)[equipment.status]?.color)}>
                {(statusConfig as Record<string, { color: string; label: string }>)[equipment.status]?.label}
              </Badge>
              <span className="text-xs font-bold text-slate-400 dark:text-navy-600 uppercase tracking-widest">{equipment.category} deployment</span>
            </div>
            <h1 className="text-5xl font-bold tracking-normal text-slate-900 dark:text-white uppercase">
              {equipment.name}
            </h1>
            <p className="text-slate-500 dark:text-navy-400 font-medium mt-1">
              Asset ID: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">{equipment.serialNumber || equipment._id?.slice(-8).toUpperCase()}</span> • {equipment.brand || 'Generic'} {equipment.model || 'Model X'}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => navigate(`/equipment/edit/${id}`)}
            className="h-12 bg-white dark:bg-navy-950 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-navy-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-navy-900 rounded-2xl px-6 font-bold transition-all shadow-sm flex items-center gap-2 group"
          >
            <Edit className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform" />
            Modify Asset
          </Button>
          <Button
            variant="outline"
            className="h-12 border-2 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl px-6 font-bold transition-all flex items-center gap-2 group"
          >
            <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Retire Station
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Operation Status</CardTitle>
            <div className={cn("p-2 rounded-xl transition-transform group-hover:scale-110", (statusConfig as Record<string, { color: string }>)[equipment.status]?.color)}>
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white uppercase">{(statusConfig as Record<string, { label: string }>)[equipment.status]?.label}</div>
            <p className="text-xs font-bold text-slate-400 dark:text-navy-600 mt-1 uppercase tracking-widest">Active deployment</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Scheduled Service</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white uppercase">
              {daysUntilMaintenance !== null ? (
                <span className={cn(daysUntilMaintenance < 7 ? 'text-amber-500 animate-pulse' : '')}>
                  In {daysUntilMaintenance} Days
                </span>
              ) : (
                'STANDBY'
              )}
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-navy-600 mt-1 uppercase tracking-widest text-wrap">Maintenance window</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Service Overhead</CardTitle>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110">
              <Wrench className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-normal">${totalMaintenanceCost.toFixed(2)}</div>
            <p className="text-xs font-bold text-slate-400 dark:text-navy-600 mt-1 uppercase tracking-widest">{maintenanceHistory.length} lifecycle events</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Asset Valuation</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-normal">
              ${(equipment.purchasePrice || 0).toLocaleString()}
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-navy-600 mt-1 uppercase tracking-widest">Gross value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Equipment Information */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-[2.5rem] overflow-hidden transition-colors">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold text-slate-400 dark:text-navy-600 uppercase tracking-wider flex items-center gap-3">
                <Package className="h-4 w-4" />
                ASSET SPECIFICATIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Faculty Sub-sector</label>
                  <div className="flex">
                    <Badge className={cn('px-3 py-1 font-bold text-xs uppercase tracking-widest rounded-xl border-none shadow-sm', (categoryColors as Record<string, string>)[equipment.category.toLowerCase()] || categoryColors.other)}>
                      {equipment.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500 flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    Operational Zone
                  </label>
                  <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">{equipment.location || 'Main Floor'}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Brand Identity & Model</label>
                  <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {equipment.brand || 'Generic'} / {equipment.model || 'Standard'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Acquisition Pulse</label>
                  <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Warranty Safeguard</label>
                  <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                    {equipment.warrantyExpiry ? `Expires ${new Date(equipment.warrantyExpiry).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}` : 'N/A'}
                  </p>
                </div>
              </div>

              {equipment.notes && (
                <div className="pt-6 border-t border-slate-100 dark:border-navy-800 transition-colors">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-navy-500">Operational Intel</label>
                  <p className="text-slate-600 dark:text-navy-400 mt-3 text-lg leading-relaxed font-medium">{equipment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance History */}
          <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-[2.5rem] overflow-hidden transition-colors">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-sm font-bold text-slate-400 dark:text-navy-600 uppercase tracking-wider flex items-center gap-3">
                <Wrench className="h-4 w-4" />
                LIFECYCLE LOG
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <div className="space-y-6">
                {maintenanceHistory.map((record: { id: string; cost: number; type: string; date: string; description: string; technician?: string }) => (
                  <div
                    key={record.id}
                    className="group flex flex-col md:flex-row md:items-center gap-6 p-6 rounded-[2rem] bg-slate-50/50 dark:bg-navy-950/50 border border-transparent hover:border-indigo-500/10 hover:bg-white dark:hover:bg-navy-900 transition-all duration-500"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">{record.type}</h4>
                        <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-bold text-[11px] uppercase tracking-widest px-2 py-0.5 shadow-none group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">Verified</Badge>
                      </div>
                      <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.15em] flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        Executed: {new Date(record.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-base text-slate-600 dark:text-navy-400 font-medium leading-relaxed mt-2">{record.description}</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3 min-w-[140px]">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-normal">${(record.cost || 0).toFixed(2)}</div>
                      <div className="py-1 px-3 bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800 rounded-xl text-[11px] font-bold text-slate-400 dark:text-navy-500 tracking-widest uppercase transition-colors">
                        FAC: {(record.technician || 'UNKNOWN').toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
                {maintenanceHistory.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No maintenance records found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-8">
          <Card className="bg-indigo-600 dark:bg-indigo-600 border-none rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-500/20 group relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Wrench className="h-32 w-32 text-white" />
            </div>
            <CardHeader className="p-8 pb-4 relative z-10">
              <CardTitle className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Maintenance Pulse</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 relative z-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest opacity-80">Last Event</label>
                <p className="text-xl font-bold text-white">{equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest opacity-80">Next Critical Window</label>
                <p className={cn('text-3xl font-bold text-white tracking-tight', daysUntilMaintenance && daysUntilMaintenance < 7 ? 'text-amber-300' : '')}>
                  {equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'N/A'}
                </p>
                {daysUntilMaintenance && daysUntilMaintenance < 7 && (
                  <div className="flex items-center gap-2 mt-3 bg-white/10 backdrop-blur-md rounded-xl p-3 text-amber-300 border border-white/10 animate-pulse">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Priority Intervention Required</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-[2.5rem] overflow-hidden transition-colors">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xs font-bold text-slate-400 dark:text-navy-600 uppercase tracking-widest">Tactical Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <Wrench className="h-4 w-4" />
                Schedule Maintenance
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 border-2 border-slate-100 dark:border-navy-800 text-slate-600 dark:text-navy-400 hover:bg-slate-50 dark:hover:bg-navy-800 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all"
              >
                Record Service Event
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 border-2 border-slate-100 dark:border-navy-800 text-slate-600 dark:text-navy-400 hover:bg-slate-50 dark:hover:bg-navy-800 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all"
              >
                Generate Audit Report
              </Button>
              <Button
                variant="outline"
                className="w-full h-14 border-2 border-slate-100 dark:border-navy-800 text-slate-600 dark:text-navy-400 hover:bg-slate-50 dark:hover:bg-navy-800 rounded-2xl font-bold uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 transition-all"
              >
                Relocate Equipment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
