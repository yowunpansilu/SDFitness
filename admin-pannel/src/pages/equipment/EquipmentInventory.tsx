import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Wrench, AlertTriangle, CheckCircle, XCircle, Calendar, Loader2, type LucideIcon } from 'lucide-react';
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

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  working: {
    label: 'Working',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100  ',
    icon: CheckCircle,
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-amber-50 text-amber-600 border-amber-100  ',
    icon: Wrench,
  },
  broken: {
    label: 'Broken',
    color: 'bg-rose-50 text-rose-600 border-rose-100  ',
    icon: XCircle,
  },
  retired: {
    label: 'Retired',
    color: 'bg-slate-100 text-slate-600 border-slate-200  ',
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
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const workingCount = equipment.filter(e => e.status === 'working').length;
  const maintenanceCount = equipment.filter(e => e.status === 'maintenance').length;
  const brokenCount = equipment.filter(e => e.status === 'broken').length;

  return (
    <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gym <span className="text-indigo-600 dark:text-indigo-400">Inventory</span>
          </h1>
          <p className="text-slate-500 dark:text-navy-400 font-medium mt-1">
            Track equipment health, maintenance cycles and facility assets.
          </p>
        </div>
        <Button
          onClick={() => navigate('/equipment/add')}
          className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Asset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-navy-400">Total Units</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-transform group-hover:scale-110 shadow-sm">
              <Plus className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-navy-200" />
            ) : (
              <>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{equipment.length}</div>
                <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Active in facility</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Fully Functional</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110 shadow-sm">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{workingCount}</div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Safe for use</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">Maintenance</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-transform group-hover:scale-110 shadow-sm">
              <Wrench className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{maintenanceCount}</div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Being serviced</p>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-2xl overflow-hidden group transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Out of Order</CardTitle>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-transform group-hover:scale-110 shadow-sm">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{brokenCount}</div>
            <p className="text-xs font-medium text-slate-400 dark:text-navy-500 mt-1 uppercase tracking-wider font-bold">Urgent attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
              <Input
                placeholder="Search by name, brand, or serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 h-11 bg-slate-50 dark:bg-navy-950 border-transparent focus:bg-white dark:focus:bg-navy-950 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all dark:text-white"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] h-11 bg-slate-50 dark:bg-navy-950 border-transparent rounded-xl focus:ring-indigo-500/10 shadow-none dark:text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-navy-800 dark:bg-navy-900 dark:text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="broken">Broken</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] h-11 bg-slate-50 dark:bg-navy-950 border-transparent rounded-xl focus:ring-indigo-500/10 shadow-none dark:text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-navy-800 dark:bg-navy-900 dark:text-white">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="free_weights">Free Weights</SelectItem>
                  <SelectItem value="functional">Functional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Table */}
      <Card className="bg-white dark:bg-navy-900 border-slate-200/60 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden font-medium transition-colors">
        <CardHeader className="border-b border-slate-100 dark:border-navy-800 pb-6 bg-slate-50/30 dark:bg-navy-950/30 ">
          <CardTitle className="text-slate-900 dark:text-white font-bold text-xl">Asset Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 dark:border-navy-800 hover:bg-transparent">
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4 pl-6">Equipment</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4">Category</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4">Serial Number</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4">Location</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4">Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 p-4 pr-6">Maintenance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipment.map((equipment) => {
                  const statusCfg = statusConfig[equipment.status] || statusConfig.working;
                  const StatusIcon = statusCfg.icon || CheckCircle;
                  const isMaintenanceDue = equipment.nextMaintenance &&
                    new Date(equipment.nextMaintenance) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                  return (
                    <TableRow
                      key={equipment.id}
                      onClick={() => navigate(`/equipment/${equipment.id}`)}
                      className="border-b border-slate-50 dark:border-navy-800/50 hover:bg-slate-50/50 dark:hover:bg-navy-950/50 transition-all cursor-pointer group"
                    >
                      <TableCell className="p-4 pl-6">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase text-[11px] tracking-tight">{equipment.name}</p>
                          <p className="text-xs font-medium text-slate-400 dark:text-navy-500 transition-colors font-bold uppercase tracking-wider">{equipment.brand} • {equipment.model}</p>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge variant="outline" className="font-bold text-xs uppercase tracking-wider rounded-lg border-indigo-100 dark:border-navy-800 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-500/5 transition-colors">
                          {categoryLabels[equipment.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="text-xs font-bold font-mono text-slate-500 dark:text-navy-400 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded transition-colors">
                          {equipment.serialNumber}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 text-xs font-bold text-slate-600 dark:text-navy-500">{equipment.location}</TableCell>
                      <TableCell className="p-4">
                        <Badge className={cn(statusCfg.color, 'font-bold text-xs uppercase tracking-widest rounded-lg border shadow-none px-2 flex items-center gap-1.5 w-fit transition-colors')}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 pr-6">
                        {equipment.nextMaintenance ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400 dark:text-navy-600" />
                            <div className="flex flex-col">
                              <span className={cn(
                                "text-xs font-bold transition-colors",
                                isMaintenanceDue ? "text-amber-600" : "text-slate-400 dark:text-navy-500"
                              )}>
                                {new Date(equipment.nextMaintenance).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                              {isMaintenanceDue && (
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-normal">Due soon</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300 dark:text-navy-800 text-xs font-bold uppercase tracking-widest font-bold">No schedule</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredEquipment.length === 0 && (
            <div className="text-center py-20 bg-slate-50/20 dark:bg-navy-950/20 transition-colors">
              <div className="inline-flex p-4 rounded-full bg-slate-100 dark:bg-navy-950 mb-4 transition-transform hover:rotate-12">
                <Search className="h-8 w-8 text-slate-400 dark:text-navy-800" />
              </div>
              <h3 className="text-slate-900 dark:text-white font-bold text-lg uppercase tracking-tight">No assets found</h3>
              <p className="text-slate-400 dark:text-navy-500 text-sm font-medium">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
