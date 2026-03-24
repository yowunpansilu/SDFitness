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

// Mock data
const mockEquipment = {
  id: '1',
  name: 'Treadmill Pro X5',
  category: 'cardio' as const,
  brand: 'RunMaster',
  model: 'X5-2024',
  serialNumber: 'RM-TM-001234',
  purchaseDate: '2023-06-15',
  lastMaintenance: '2024-01-15',
  nextMaintenance: '2024-04-15',
  status: 'working' as const,
  location: 'Cardio Zone A',
  purchasePrice: 5499.99,
  warrantyExpiry: '2026-06-15',
  notes: 'High-performance commercial treadmill with advanced cushioning system.',
};

const maintenanceHistory = [
  {
    id: '1',
    date: '2024-01-15',
    type: 'Routine Maintenance',
    description: 'Belt lubrication, tension adjustment, general inspection',
    technician: 'John Smith',
    cost: 150.00,
    status: 'completed',
  },
  {
    id: '2',
    date: '2023-10-10',
    type: 'Repair',
    description: 'Replaced console display unit',
    technician: 'Sarah Johnson',
    cost: 450.00,
    status: 'completed',
  },
  {
    id: '3',
    date: '2023-07-20',
    type: 'Routine Maintenance',
    description: 'Belt replacement, roller inspection',
    technician: 'John Smith',
    cost: 320.00,
    status: 'completed',
  },
];

export function EquipmentDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const daysUntilMaintenance = mockEquipment.nextMaintenance
    ? Math.ceil(
      (new Date(mockEquipment.nextMaintenance).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
    )
    : null;

  const totalMaintenanceCost = maintenanceHistory.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/equipment')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {mockEquipment.name}
            </h1>
            <p className="text-gray-400 mt-2">Equipment Details & Maintenance History</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/equipment/edit/${id}`)}
            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Equipment
          </Button>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Retire
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={cn('text-base', statusConfig[mockEquipment.status].color)}>
              {statusConfig[mockEquipment.status].icon} {statusConfig[mockEquipment.status].label}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Next Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {daysUntilMaintenance !== null ? (
                <span className={cn(daysUntilMaintenance < 7 ? 'text-yellow-400' : '')}>
                  {daysUntilMaintenance} days
                </span>
              ) : (
                'Not scheduled'
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalMaintenanceCost.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">{maintenanceHistory.length} services</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Purchase Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ${mockEquipment.purchasePrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Equipment Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Package className="h-5 w-5" />
                Equipment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Category</label>
                  <div className="mt-1">
                    <Badge className={cn(categoryColors[mockEquipment.category])}>
                      {mockEquipment.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <p className="text-white mt-1">{mockEquipment.location}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Brand & Model</label>
                  <p className="text-white mt-1">
                    {mockEquipment.brand} {mockEquipment.model}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Serial Number</label>
                  <p className="text-white mt-1 font-mono text-sm">{mockEquipment.serialNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Purchase Date</label>
                  <p className="text-white mt-1">
                    {new Date(mockEquipment.purchaseDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Warranty Expiry</label>
                  <p className="text-white mt-1">
                    {new Date(mockEquipment.warrantyExpiry).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {mockEquipment.notes && (
                <div>
                  <label className="text-sm text-gray-400">Notes</label>
                  <p className="text-white mt-1">{mockEquipment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Maintenance History */}
          <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceHistory.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-lg bg-dark-800/50 border border-dark-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-semibold">{record.type}</h4>
                        <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ${record.cost.toFixed(2)}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{record.description}</p>
                    <p className="text-xs text-gray-500">Technician: {record.technician}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm">Maintenance Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Last Maintenance</label>
                <p className="text-white">{new Date(mockEquipment.lastMaintenance).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Next Maintenance</label>
                <p className={cn('text-white', daysUntilMaintenance && daysUntilMaintenance < 7 ? 'text-yellow-400 font-semibold' : '')}>
                  {new Date(mockEquipment.nextMaintenance).toLocaleDateString()}
                </p>
                {daysUntilMaintenance && daysUntilMaintenance < 7 && (
                  <div className="flex items-center gap-2 mt-2 text-yellow-400 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Due soon!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                <Wrench className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
              <Button
                variant="outline"
                className="w-full border-dark-700 text-gray-300 hover:bg-dark-800"
              >
                Record Service
              </Button>
              <Button
                variant="outline"
                className="w-full border-dark-700 text-gray-300 hover:bg-dark-800"
              >
                Generate Report
              </Button>
              <Button
                variant="outline"
                className="w-full border-dark-700 text-gray-300 hover:bg-dark-800"
              >
                Change Location
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
