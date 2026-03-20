import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Copy,
    Users,
    Calendar,
    Clock,
    MapPin,
    User,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ClassMember {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    status: 'enrolled' | 'attended' | 'absent';
    enrolledAt: string;
}

interface ClassData {
    id: string;
    name: string;
    type: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    description: string;
    schedule: {
        date: string;
        startTime: string;
        endTime: string;
        recurrence: string;
    };
    trainer: {
        id: string;
        name: string;
        avatar?: string;
        specialization: string;
    };
    location: string;
    capacity: number;
    enrolled: number;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    members: ClassMember[];
    notes?: string;
}

// Mock data
const MOCK_CLASS: ClassData = {
    id: '1',
    name: 'HIIT Training',
    type: 'Cardio',
    level: 'Intermediate',
    description: 'High-Intensity Interval Training designed to burn calories and improve cardiovascular fitness. This class combines short bursts of intense exercise with recovery periods.',
    schedule: {
        date: '2026-02-10',
        startTime: '18:00',
        endTime: '19:00',
        recurrence: 'Every Monday, Wednesday, Friday',
    },
    trainer: {
        id: '1',
        name: 'Mike Ross',
        avatar: '',
        specialization: 'HIIT & Cardio',
    },
    location: 'Studio A',
    capacity: 20,
    enrolled: 15,
    status: 'scheduled',
    members: [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            status: 'enrolled',
            enrolledAt: '2026-02-01',
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            status: 'enrolled',
            enrolledAt: '2026-02-02',
        },
        {
            id: '3',
            name: 'Bob Johnson',
            email: 'bob@example.com',
            status: 'enrolled',
            enrolledAt: '2026-02-03',
        },
    ],
    notes: 'Please bring a yoga mat and water bottle. Arrive 10 minutes early for setup.',
};

const STATUS_COLORS = {
    scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
    completed: 'bg-gray-500/20 text-muted-foreground border-gray-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const LEVEL_COLORS = {
    Beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
    Intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function ClassDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [classData] = useState<ClassData>(MOCK_CLASS);

    const handleEdit = () => {
        navigate(`/admin/classes/${id}/edit`);
    };

    const handleDuplicate = () => {
        toast({
            title: 'Class Duplicated',
            description: 'A copy of this class has been created',
        });
    };

    const handleDelete = () => {
        toast({
            title: 'Class Deleted',
            description: 'The class has been removed from the schedule',
            variant: 'destructive',
        });
        navigate('/admin/classes');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    const availableSpots = classData.capacity - classData.enrolled;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/classes')}
                        className="text-muted-foreground hover:text-foreground hover:bg-card"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{classData.name}</h1>
                        <p className="text-muted-foreground">Class Details</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDuplicate}
                        className="bg-card border-border text-muted-foreground hover:bg-muted"
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
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
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/30">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={STATUS_COLORS[classData.status]}>
                                    {classData.status.toUpperCase()}
                                </Badge>
                                <Badge variant="outline" className={LEVEL_COLORS[classData.level]}>
                                    {classData.level}
                                </Badge>
                                <Badge variant="outline" className="bg-card text-muted-foreground border-border">
                                    {classData.type}
                                </Badge>
                            </div>

                            <p className="text-muted-foreground max-w-2xl">{classData.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-purple-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Enrolled</div>
                                        <div className="text-foreground font-semibold">
                                            {classData.enrolled}/{classData.capacity}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-purple-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Date</div>
                                        <div className="text-foreground font-semibold">
                                            {new Date(classData.schedule.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-purple-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Time</div>
                                        <div className="text-foreground font-semibold">
                                            {classData.schedule.startTime} - {classData.schedule.endTime}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-purple-400" />
                                    <div>
                                        <div className="text-sm text-muted-foreground">Location</div>
                                        <div className="text-foreground font-semibold">{classData.location}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-4xl font-bold text-foreground">{availableSpots}</div>
                            <div className="text-sm text-muted-foreground">Spots Available</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trainer Information */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <User className="h-5 w-5 text-purple-400" />
                            Trainer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={classData.trainer.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-foreground text-lg">
                                    {getInitials(classData.trainer.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold text-foreground">{classData.trainer.name}</div>
                                <div className="text-sm text-muted-foreground">{classData.trainer.specialization}</div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full bg-card border-border text-muted-foreground hover:bg-muted"
                        >
                            View Profile
                        </Button>
                    </CardContent>
                </Card>

                {/* Schedule Information */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-400" />
                            Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <div className="text-sm text-muted-foreground">Recurrence</div>
                            <div className="text-foreground">{classData.schedule.recurrence}</div>
                        </div>
                        <Separator className="bg-muted" />
                        <div>
                            <div className="text-sm text-muted-foreground">Duration</div>
                            <div className="text-foreground">60 minutes</div>
                        </div>
                        <Separator className="bg-muted" />
                        <div>
                            <div className="text-sm text-muted-foreground">Next Session</div>
                            <div className="text-foreground">
                                {new Date(classData.schedule.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card className="bg-background/50 border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">{classData.notes || 'No additional notes'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Enrolled Members */}
            <Card className="bg-background/50 border-border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-foreground">Enrolled Members</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {classData.enrolled} members enrolled
                            </CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            className="bg-card border-border text-muted-foreground hover:bg-muted"
                        >
                            Add Member
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {classData.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-card/50 hover:bg-card transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-foreground">
                                            {getInitials(member.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-foreground">{member.name}</div>
                                        <div className="text-sm text-muted-foreground">{member.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-muted-foreground">
                                        Enrolled {new Date(member.enrolledAt).toLocaleDateString()}
                                    </div>
                                    {member.status === 'enrolled' && (
                                        <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                            Enrolled
                                        </Badge>
                                    )}
                                    {member.status === 'attended' && (
                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                    )}
                                    {member.status === 'absent' && (
                                        <XCircle className="h-5 w-5 text-red-400" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
