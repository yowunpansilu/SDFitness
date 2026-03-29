import { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Wrench, Shield, CheckCircle, AlertCircle, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { equipmentService } from '@/services/equipmentService';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceLog {
  date: string;
  type: string;
  performedBy: string;
  notes: string;
}

interface Equipment {
  _id: string;
  name: string;
  category: string;
  status: 'working' | 'maintenance' | 'broken';
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  location: string;
  purchaseDate: string;
  condition: number;
  qrCode?: string;
  maintenanceLog: MaintenanceLog[];
}

const statusConfig = {
  working: {
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    icon: CheckCircle,
    label: 'OPERATIONAL'
  },
  maintenance: {
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    icon: Wrench,
    label: 'OFFLINE_MAINT'
  },
  broken: {
    color: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    icon: AlertCircle,
    label: 'CRITICAL_FAILURE'
  }
};

export function EquipmentInventory() {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await equipmentService.getEquipment();
      setEquipment(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: 'Network Disturbance',
        description: 'Failed to access physical asset database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Confirm asset decommissioning of ${name}?`)) return;
    try {
      await equipmentService.deleteEquipment(id);
      toast({ title: 'Asset Purged', description: `${name} has been removed from inventory.` });
      setEquipment(prev => prev.filter(e => e._id !== id));
    } catch (error) {
       toast({ title: 'Execution Failed', description: 'Could not delete equipment.', variant: 'destructive' });
    }
  };

  const equipmentArray = Array.isArray(equipment) ? equipment : [];

  const filteredEquipment = equipmentArray.filter((item) => {
    const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (item.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (item.category || '').toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const maintenanceCount = equipmentArray.filter(e => e.status !== 'working').length;
  const criticalCount = equipmentArray.filter(e => e.status === 'broken').length;

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Scanning Hardware Matrix...</p>
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
            Hardware <span className="text-indigo-600 italic font-medium">Inventory</span>
          </h1>
          <p className="text-slate-700 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Asset management and maintenance protocols
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-900/20 h-11 px-6 font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 border border-slate-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Onboard New Asset
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-700">Total Assets</CardTitle>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 transition-transform group-hover:scale-110 shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{equipmentArray.length}</div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Active nodes</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Operational</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 shadow-sm">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">
               {equipmentArray.filter(e => e.status === 'working').length}
            </div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Fully optimized</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-amber-500">Pending Maint.</CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-110 shadow-sm">
              <Wrench className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{maintenanceCount}</div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Under protocol review</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden group transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-rose-500">Failure Points</CardTitle>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 transition-transform group-hover:scale-110 shadow-sm">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{criticalCount}</div>
            <p className="text-[9px] font-black text-slate-800 mt-1 uppercase tracking-widest">Immediate response needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-300 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700 group-focus-within:text-indigo-600 transition-all" />
              <input
                placeholder="Find Hardware: Asset name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 h-11 bg-slate-50 border-2 border-slate-300 focus:border-indigo-500/50 rounded-xl transition-all font-bold text-xs uppercase tracking-widest text-slate-900 placeholder:text-slate-900 outline-none"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[220px] h-11 bg-slate-50 border-none rounded-xl focus:ring-indigo-500/10 font-bold text-xs text-slate-900 uppercase tracking-widest">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white border-slate-300 text-slate-900">
                <SelectItem value="all" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Global Array</SelectItem>
                <SelectItem value="cardio" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Cardio Systems</SelectItem>
                <SelectItem value="strength" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Strength Hardware</SelectItem>
                <SelectItem value="flexibility" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Flexibility Tools</SelectItem>
                <SelectItem value="weights" className="uppercase text-[10px] font-black tracking-widest cursor-pointer">Free Weights</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipment.map((item) => {
          const config = statusConfig[item.status] || statusConfig.working;
          const StatusIcon = config.icon;
          return (
            <Card
              key={item._id}
              className="bg-white border-slate-300 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem] overflow-hidden group border-2 border-slate-300 hover:border-indigo-500/20"
            >
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className={cn("p-4 rounded-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg", config.color)}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <Badge className={cn("font-black text-[9px] uppercase tracking-widest border-none px-3 py-1 rounded-lg shadow-none", config.color)}>
                     {config.label}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                    {item.name}
                  </h3>
                  <p className="text-[10px] font-black uppercase text-slate-800 mt-1 tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500/20" />
                    {item.location}
                  </p>
                </div>

                {/* Condition Bar */}
                <div className="space-y-2 bg-slate-50/50 p-4 rounded-3xl transition-all">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-700">Node Integrity</span>
                    <span className="text-slate-900">{item.condition}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", item.condition > 75 ? "bg-emerald-500" : item.condition > 40 ? "bg-amber-500" : "bg-rose-500")}
                      style={{ width: `${item.condition}%` }}
                    />
                  </div>
                </div>

                {/* Maintenance Info */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                     <Clock className="h-3 w-3 text-indigo-600" />
                     <span>Protocol: {item.nextMaintenanceDate ? new Date(item.nextMaintenanceDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                     <Shield className="h-3 w-3 text-indigo-600" />
                     <span>Unit Type: {item.category}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="ghost" className="flex-1 h-10 rounded-xl bg-slate-50 text-indigo-600 hover:bg-indigo-500 hover:text-white font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all">
                      Diagnostics
                    </Button>
                    <Button 
                      onClick={() => handleDelete(item._id, item.name)}
                      variant="ghost" 
                      className="h-10 w-10 p-0 rounded-xl bg-slate-50 text-rose-500 hover:bg-rose-500 hover:text-white font-black active:scale-95 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEquipment.length === 0 && (
         <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-300">
            <Search className="h-12 w-12 text-slate-900 mx-auto mb-6" />
            <h3 className="text-slate-900 font-black text-xl uppercase tracking-widest">Hardware Node Not Found</h3>
            <p className="text-slate-700 font-bold text-xs uppercase tracking-widest">Adjustment of tracking parameters required</p>
         </div>
      )}
    </div>
  );
}
