import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Mail, UserX, Plus } from 'lucide-react';
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

// Mock data - will be replaced with API calls
const mockMembers = [
    {
        id: '1',
        memberNumber: 'GYM-2026-0001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        status: 'active',
        membershipType: 'Premium',
        joinDate: '2024-01-15',
        profilePhoto: null,
    },
    {
        id: '2',
        memberNumber: 'GYM-2026-0002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1 234 567 8901',
        status: 'active',
        membershipType: 'Basic',
        joinDate: '2024-02-20',
        profilePhoto: null,
    },
    {
        id: '3',
        memberNumber: 'GYM-2026-0003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.j@example.com',
        phone: '+1 234 567 8902',
        status: 'frozen',
        membershipType: 'Premium',
        joinDate: '2023-11-10',
        profilePhoto: null,
    },
    {
        id: '4',
        memberNumber: 'GYM-2026-0004',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.w@example.com',
        phone: '+1 234 567 8903',
        status: 'inactive',
        membershipType: 'Elite',
        joinDate: '2023-08-05',
        profilePhoto: null,
    },
];

const statusColors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    frozen: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function MembersList() {
    const navigate = useNavigate();
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const toggleMemberSelection = (memberId: string) => {
        setSelectedMembers(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const toggleAllMembers = () => {
        setSelectedMembers(prev =>
            prev.length === mockMembers.length
                ? []
                : mockMembers.map(m => m.id)
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Members Management
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Manage all gym members, memberships, and profiles
                    </p>
                </div>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:shadow-purple-500/40">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                </Button>
            </div>

            {/* Filters and Actions */}
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by name, email, or member number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-dark-800/50 border-dark-700 focus:border-purple-500/50 focus:ring-purple-500/20 text-white placeholder:text-gray-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[180px] bg-dark-800/50 border-dark-700 text-white">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-900 border-dark-700 text-white">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="frozen">Frozen</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Membership Type Filter */}
                        <Select>
                            <SelectTrigger className="w-full md:w-[180px] bg-dark-800/50 border-dark-700 text-white">
                                <SelectValue placeholder="Membership type" />
                            </SelectTrigger>
                            <SelectContent className="bg-dark-900 border-dark-700 text-white">
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="basic">Basic</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="elite">Elite</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedMembers.length > 0 && (
                        <div className="mt-4 flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                            <span className="text-sm text-purple-400 font-medium">
                                {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex gap-2 ml-auto">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white hover:bg-dark-800"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-gray-400 hover:text-white hover:bg-dark-800"
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
            <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        All Members
                        <span className="text-sm font-normal text-gray-400">
                            {mockMembers.length} total members
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-dark-800 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-dark-950/50 border-dark-800 hover:bg-dark-950/50">
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedMembers.length === mockMembers.length}
                                            onCheckedChange={toggleAllMembers}
                                            className="border-gray-600"
                                        />
                                    </TableHead>
                                    <TableHead className="text-gray-400">Member</TableHead>
                                    <TableHead className="text-gray-400">Member Number</TableHead>
                                    <TableHead className="text-gray-400">Contact</TableHead>
                                    <TableHead className="text-gray-400">Membership</TableHead>
                                    <TableHead className="text-gray-400">Status</TableHead>
                                    <TableHead className="text-gray-400">Join Date</TableHead>
                                    <TableHead className="text-gray-400 w-12"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockMembers.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        onClick={() => navigate(`/members/${member.id}`)}
                                        className="border-dark-800 hover:bg-dark-800/30 transition-colors cursor-pointer"
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedMembers.includes(member.id)}
                                                onCheckedChange={() => toggleMemberSelection(member.id)}
                                                className="border-gray-600"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                                                    <AvatarImage src={member.profilePhoto || undefined} />
                                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-sm font-semibold">
                                                        {member.firstName[0]}{member.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        {member.firstName} {member.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{member.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-400 font-mono text-sm">
                                            {member.memberNumber}
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-sm">
                                            {member.phone}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                                {member.membershipType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={statusColors[member.status as keyof typeof statusColors]}>
                                                {member.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-400 text-sm">
                                            {new Date(member.joinDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-dark-800"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-dark-900 border-dark-700 text-white">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/members/${member.id}`);
                                                        }}
                                                        className="focus:bg-dark-800 cursor-pointer"
                                                    >
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="focus:bg-dark-800 cursor-pointer">
                                                        Edit Member
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="focus:bg-dark-800 cursor-pointer">
                                                        View Payments
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
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
                        <p className="text-sm text-gray-400">
                            Showing 1 to {mockMembers.length} of {mockMembers.length} members
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="border-dark-700 text-gray-400 hover:bg-dark-800 hover:text-white"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="border-dark-700 text-gray-400 hover:bg-dark-800 hover:text-white"
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
