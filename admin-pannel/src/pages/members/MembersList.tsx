import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Mail, UserX, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import api from '@/lib/api/axios';

interface Member {
    _id: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    membershipType: string;
    joinDate: string;
    status: string;
    phone: string;
    healthMetrics?: {
        weight: number;
        height: number;
    };
}

const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
    suspended: 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
    frozen: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
};

export function MembersList() {
    const navigate = useNavigate();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await api.get('/members');
                setMembers(response.data);
            } catch (err) {
                console.error('Failed to fetch members:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const filteredMembers = members.filter((member) => {
        const firstName = member.user?.firstName || '';
        const lastName = member.user?.lastName || '';
        const email = member.user?.email || '';
        const matchesSearch =
            firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || member.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const toggleMemberSelection = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const toggleAllMembers = () => {
        setSelectedMembers(prev =>
            prev.length === filteredMembers.length
                ? []
                : filteredMembers.map(m => m._id)
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 dark:text-purple-500" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading members...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Members Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage all gym members, memberships, and profiles
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/members/add')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                </Button>
            </div>

            {/* Filters and Actions */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 focus:border-purple-500/50 focus:ring-purple-500/20 text-gray-900 dark:text-white placeholder:text-gray-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="frozen">Frozen</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedMembers.length > 0 && (
                        <div className="mt-4 flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-lg">
                            <span className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                                {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex gap-2 ml-auto">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Deactivate
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Members Table */}
            <Card className="bg-white dark:bg-dark-900/50 border-gray-200 dark:border-dark-800 backdrop-blur-sm shadow-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white flex items-center justify-between">
                        All Members
                        <span className="text-sm font-normal text-gray-400">
                            {filteredMembers.length} total members
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-gray-200 dark:border-dark-800 overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 dark:bg-dark-950/50 border-gray-200 dark:border-dark-800 hover:bg-gray-50/50 dark:hover:bg-dark-950/50">
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                                            onCheckedChange={toggleAllMembers}
                                            className="border-gray-300 dark:border-gray-600"
                                        />
                                    </TableHead>
                                    <TableHead className="text-gray-600 dark:text-gray-400">Member</TableHead>
                                    <TableHead className="text-gray-600 dark:text-gray-400">Contact</TableHead>
                                    <TableHead className="text-gray-600 dark:text-gray-400">Membership</TableHead>
                                    <TableHead className="text-gray-600 dark:text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-600 dark:text-gray-400">Join Date</TableHead>
                                    <TableHead className="text-gray-400 w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMembers.map((member) => (
                                    <TableRow
                                        key={member._id}
                                        onClick={() => navigate(`/members/${member._id}`)}
                                        className="border-gray-200 dark:border-dark-800 hover:bg-gray-50 dark:hover:bg-dark-800/30 transition-colors cursor-pointer"
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedMembers.includes(member._id)}
                                                onCheckedChange={() => toggleMemberSelection(member._id)}
                                                className="border-gray-300 dark:border-gray-600"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                                                    <AvatarImage src={undefined} />
                                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm font-semibold">
                                                        {(member.user?.firstName || '?')[0]}{(member.user?.lastName || '?')[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {member.user?.firstName} {member.user?.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{member.user?.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                                            {member.phone || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30">
                                                {member.membershipType || 'Standard'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[member.status] || statusColors['active']}>
                                                {member.status || 'active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                                            {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/members/${member._id}`);
                                                        }}
                                                        className="focus:bg-gray-100 dark:focus:bg-dark-800 cursor-pointer text-gray-700 dark:text-gray-300"
                                                    >
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-dark-800 cursor-pointer text-gray-700 dark:text-gray-300">
                                                        Edit Member
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-500 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-300 cursor-pointer">
                                                        Delete Member
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Showing {filteredMembers.length} of {members.length} members
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
