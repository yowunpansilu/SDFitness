import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, CreditCard, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

// Mock data - will be replaced with API call
const mockMember = {
    id: '1',
    memberNumber: 'GYM-2026-0001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    status: 'active',
    joinDate: '2024-01-15',
    profilePhoto: null,
    currentMembership: {
        plan: 'Premium',
        startDate: '2024-01-15',
        endDate: '2024-07-15',
        status: 'active',
    },
    healthMetrics: {
        height: 175,
        weight: 75,
        targetWeight: 70,
        bmi: 24.5,
        fitnessGoals: ['weight_loss', 'muscle_gain'],
    },
    trainer: {
        name: 'Sarah Johnson',
        specialization: 'Strength Training',
    },
    emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 234 567 8901',
    },
};

const paymentHistory = [
    { id: '1', date: '2024-01-15', amount: 99.99, plan: 'Premium', status: 'paid' },
    { id: '2', date: '2023-07-15', amount: 99.99, plan: 'Premium', status: 'paid' },
    { id: '3', date: '2023-01-15', amount: 79.99, plan: 'Basic', status: 'paid' },
];

const attendanceRecords = [
    { date: '2024-02-03', checkIn: '06:30 AM', checkOut: '08:00 AM', duration: '1h 30m' },
    { date: '2024-02-02', checkIn: '06:25 AM', checkOut: '07:45 AM', duration: '1h 20m' },
    { date: '2024-02-01', checkIn: '06:35 AM', checkOut: '08:10 AM', duration: '1h 35m' },
];

const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    frozen: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function MemberDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/members')}
                        className="text-gray-400 hover:text-white hover:bg-dark-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Member Details
                        </h1>
                        <p className="text-gray-400 mt-1">
                            {mockMember.memberNumber} • Joined {new Date(mockMember.joinDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="border-dark-700 text-gray-400 hover:text-white hover:bg-dark-800"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Member
                    </Button>
                    <Button
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Profile Card */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <Avatar className="h-32 w-32 ring-4 ring-purple-500/20">
                                <AvatarImage src={mockMember.profilePhoto || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-3xl font-semibold">
                                    {mockMember.firstName[0]}{mockMember.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <Badge className={statusColors[mockMember.status as keyof typeof statusColors]}>
                                {mockMember.status}
                            </Badge>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {mockMember.firstName} {mockMember.lastName}
                                    </h2>
                                    <p className="text-gray-400 capitalize">{mockMember.gender} • {new Date().getFullYear() - new Date(mockMember.dateOfBirth).getFullYear()} years old</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Mail className="h-4 w-4" />
                                        <span className="text-sm">{mockMember.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Phone className="h-4 w-4" />
                                        <span className="text-sm">{mockMember.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">Birthday: {new Date(mockMember.dateOfBirth).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-lg bg-dark-950/50 border border-dark-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">Current Membership</span>
                                        <CreditCard className="h-4 w-4 text-purple-400" />
                                    </div>
                                    <p className="text-lg font-semibold text-white">{mockMember.currentMembership.plan}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Valid until {new Date(mockMember.currentMembership.endDate).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-dark-950/50 border border-dark-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">Assigned Trainer</span>
                                        <Activity className="h-4 w-4 text-green-400" />
                                    </div>
                                    <p className="text-lg font-semibold text-white">{mockMember.trainer.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{mockMember.trainer.specialization}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-dark-900/50 border border-dark-800">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                        Payment History
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                        Attendance
                    </TabsTrigger>
                    <TabsTrigger value="health" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                        Health Metrics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">Emergency Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-400">Name</p>
                                    <p className="text-white font-medium">{mockMember.emergencyContact.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Relationship</p>
                                    <p className="text-white font-medium">{mockMember.emergencyContact.relationship}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Phone</p>
                                    <p className="text-white font-medium">{mockMember.emergencyContact.phone}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">Fitness Goals</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {mockMember.healthMetrics.fitnessGoals.map((goal) => (
                                        <Badge key={goal} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                            {goal.replace('_', ' ')}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="payments">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Payment History</CardTitle>
                            <p className="text-sm text-gray-400">All transactions for this member</p>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-dark-800">
                                        <TableHead className="text-gray-400">Date</TableHead>
                                        <TableHead className="text-gray-400">Plan</TableHead>
                                        <TableHead className="text-gray-400">Amount</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paymentHistory.map((payment) => (
                                        <TableRow key={payment.id} className="border-dark-800">
                                            <TableCell className="text-gray-300">{new Date(payment.date).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-gray-300">{payment.plan}</TableCell>
                                            <TableCell className="text-gray-300">${payment.amount}</TableCell>
                                            <TableCell>
                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="attendance">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Recent Attendance</CardTitle>
                            <p className="text-sm text-gray-400">Check-in and check-out records</p>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-dark-800">
                                        <TableHead className="text-gray-400">Date</TableHead>
                                        <TableHead className="text-gray-400">Check In</TableHead>
                                        <TableHead className="text-gray-400">Check Out</TableHead>
                                        <TableHead className="text-gray-400">Duration</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendanceRecords.map((record, i) => (
                                        <TableRow key={i} className="border-dark-800">
                                            <TableCell className="text-gray-300">{record.date}</TableCell>
                                            <TableCell className="text-gray-300">{record.checkIn}</TableCell>
                                            <TableCell className="text-gray-300">{record.checkOut}</TableCell>
                                            <TableCell className="text-gray-300">{record.duration}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="health">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-400">Height</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-white">{mockMember.healthMetrics.height} cm</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-400">Current Weight</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-white">{mockMember.healthMetrics.weight} kg</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-400">Target Weight</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-white">{mockMember.healthMetrics.targetWeight} kg</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-400">BMI</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold text-white">{mockMember.healthMetrics.bmi}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
