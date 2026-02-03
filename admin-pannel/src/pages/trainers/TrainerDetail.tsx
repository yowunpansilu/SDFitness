import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    Award,
    Users,
    Edit,
    Trash2,
    TrendingUp,
    DollarSign,
    Clock,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface Trainer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specializations: string[];
    certifications: string[];
    assignedMembers: number;
    rating: number;
    photoUrl?: string;
    status: 'active' | 'inactive' | 'on_leave';
    hireDate: string;
    bio: string;
    emergencyContact: {
        name: string;
        phone: string;
    };
}

interface AssignedMember {
    id: string;
    name: string;
    membershipType: string;
    startDate: string;
    sessionsCompleted: number;
    photoUrl?: string;
}

// Mock data
const mockTrainer: Trainer = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@sdfitness.com',
    phone: '+1 234 567 8901',
    specializations: ['Strength Training', 'Bodybuilding', 'Powerlifting'],
    certifications: ['NASM-CPT', 'CSCS', 'USA Powerlifting Coach'],
    assignedMembers: 24,
    rating: 4.8,
    photoUrl: undefined,
    status: 'active',
    hireDate: '2023-01-15',
    bio: 'Certified personal trainer with over 8 years of experience specializing in strength training and bodybuilding. Passionate about helping clients achieve their fitness goals through customized workout programs and nutrition guidance.',
    emergencyContact: {
        name: 'John Johnson',
        phone: '+1 234 567 8999',
    },
};

const mockAssignedMembers: AssignedMember[] = [
    {
        id: '1',
        name: 'Michael Brown',
        membershipType: 'Premium',
        startDate: '2024-01-15',
        sessionsCompleted: 45,
        photoUrl: undefined,
    },
    {
        id: '2',
        name: 'Emily Davis',
        membershipType: 'VIP',
        startDate: '2024-02-20',
        sessionsCompleted: 32,
        photoUrl: undefined,
    },
    {
        id: '3',
        name: 'James Wilson',
        membershipType: 'Premium',
        startDate: '2023-11-08',
        sessionsCompleted: 78,
        photoUrl: undefined,
    },
];

const mockSchedule = [
    { day: 'Monday', time: '6:00 AM - 2:00 PM', type: 'Morning Shift' },
    { day: 'Tuesday', time: '6:00 AM - 2:00 PM', type: 'Morning Shift' },
    { day: 'Wednesday', time: '2:00 PM - 10:00 PM', type: 'Evening Shift' },
    { day: 'Thursday', time: '6:00 AM - 2:00 PM', type: 'Morning Shift' },
    { day: 'Friday', time: '2:00 PM - 10:00 PM', type: 'Evening Shift' },
    { day: 'Saturday', time: '9:00 AM - 5:00 PM', type: 'Day Shift' },
];

const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    on_leave: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export function TrainerDetail() {
    const navigate = useNavigate();
    const [trainer] = useState(mockTrainer);

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => navigate('/trainers')}
                className="text-gray-400 hover:text-white hover:bg-dark-800"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trainers
            </Button>

            {/* Trainer Header */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="h-32 w-32 ring-4 ring-purple-500/20">
                            <AvatarImage src={trainer.photoUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-3xl font-bold">
                                {trainer.firstName[0]}{trainer.lastName[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold text-white">
                                        {trainer.firstName} {trainer.lastName}
                                    </h1>
                                    <Badge className={cn('mt-2', statusColors[trainer.status])}>
                                        {trainer.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-dark-700 text-gray-400 hover:text-white hover:bg-dark-800"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="border-dark-700 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Mail className="h-4 w-4" />
                                    <span>{trainer.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Phone className="h-4 w-4" />
                                    <span>{trainer.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>Hired: {new Date(trainer.hireDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Rating: {trainer.rating} / 5.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Assigned Members</CardTitle>
                            <Users className="h-4 w-4 text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{trainer.assignedMembers}</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Rating</CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">{trainer.rating}</div>
                        <p className="text-xs text-gray-500 mt-1">out of 5.0</p>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Sessions This Month</CardTitle>
                            <Clock className="h-4 w-4 text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">156</div>
                    </CardContent>
                </Card>
                <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-400">Revenue Generated</CardTitle>
                            <DollarSign className="h-4 w-4 text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">$12,450</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-dark-900/50 border border-dark-800">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Assigned Members</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                    <TabsTrigger value="certifications">Certifications</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Bio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-400 leading-relaxed">{trainer.bio}</p>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Award className="h-5 w-5 text-purple-400" />
                                    Specializations
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {trainer.specializations.map((spec) => (
                                        <Badge key={spec} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                            {spec}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-white">Emergency Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="text-gray-400">
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="text-white">{trainer.emergencyContact.name}</p>
                                </div>
                                <div className="text-gray-400">
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="text-white">{trainer.emergencyContact.phone}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Assigned Members Tab */}
                <TabsContent value="members">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Assigned Members ({mockAssignedMembers.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-dark-700 hover:bg-transparent">
                                        <TableHead className="text-gray-400">Member</TableHead>
                                        <TableHead className="text-gray-400">Membership</TableHead>
                                        <TableHead className="text-gray-400">Start Date</TableHead>
                                        <TableHead className="text-gray-400">Sessions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockAssignedMembers.map((member) => (
                                        <TableRow
                                            key={member.id}
                                            className="border-dark-700 hover:bg-dark-800/50 cursor-pointer"
                                            onClick={() => navigate(`/members/${member.id}`)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={member.photoUrl} />
                                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-white">{member.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                                    {member.membershipType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-400">
                                                {new Date(member.startDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-white font-semibold">
                                                {member.sessionsCompleted}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Weekly Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockSchedule.map((schedule) => (
                                    <div
                                        key={schedule.day}
                                        className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-dark-700"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-24">
                                                <p className="text-white font-semibold">{schedule.day}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Clock className="h-4 w-4" />
                                                <span>{schedule.time}</span>
                                            </div>
                                        </div>
                                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                            {schedule.type}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Certifications Tab */}
                <TabsContent value="certifications">
                    <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-white">Certifications & Credentials</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                {trainer.certifications.map((cert) => (
                                    <div
                                        key={cert}
                                        className="flex items-center gap-3 p-4 rounded-lg bg-dark-800/50 border border-dark-700"
                                    >
                                        <div className="p-2 rounded-lg bg-amber-500/20">
                                            <Award className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-semibold">{cert}</p>
                                            <p className="text-sm text-gray-500">Valid</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
