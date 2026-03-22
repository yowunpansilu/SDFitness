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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
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
    active: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    suspended: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    frozen: 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        Members <span className="text-indigo-600 italic">Management</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        View, organize and maintain your gym membership community.
                    </p>
                </div>
                <Button
                    onClick={() => navigate('/members/add')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none h-11 px-6 font-bold transition-all hover:scale-105 active:scale-95"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Member
                </Button>
            </div>

            {/* Filters and Actions */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {/* Search */}
                        <div className="flex-1 w-full relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            <Input
                                placeholder="Search by name, email, or member number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 h-11 bg-slate-50 border-transparent focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px] h-11 bg-slate-50 border-transparent rounded-xl focus:ring-indigo-500/10">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="frozen">Frozen</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Membership Type Filter */}
                            <Select>
                                <SelectTrigger className="w-[160px] h-11 bg-slate-50 border-transparent rounded-xl focus:ring-indigo-500/10">
                                    <SelectValue placeholder="Membership" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="basic">Basic</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="elite">Elite</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button variant="outline" className="h-11 px-5 rounded-xl border-slate-200 font-bold text-xs text-slate-600">
                                <Download className="h-4 w-4 mr-2" /> Export
                            </Button>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedMembers.length > 0 && (
                        <div className="mt-6 flex items-center gap-4 p-3 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
                            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-3">
                                {selectedMembers.length} selected
                            </span>
                            <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-500/20" />
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-indigo-600 hover:bg-white font-bold text-xs rounded-lg transition-all">
                                    <Mail className="h-3.5 w-3.5 mr-2" /> Email
                                </Button>
                                <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-lg transition-all">
                                    <UserX className="h-3.5 w-3.5 mr-2" /> Deactivate
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Members Table */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 shadow-sm rounded-3xl overflow-hidden">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 pb-6 flex flex-row items-center justify-between bg-slate-50/30 dark:bg-slate-900/30">
                    <CardTitle className="text-slate-900 dark:text-white font-black text-xl flex items-center gap-2">
                        Member List
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                            {mockMembers.length}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-slate-100 dark:border-slate-800 hover:bg-transparent">
                                    <TableHead className="w-16 pl-6">
                                        <Checkbox
                                            checked={selectedMembers.length === mockMembers.length}
                                            onCheckedChange={toggleAllMembers}
                                            className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600"
                                        />
                                    </TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Member Info</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">ID Number</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Contact</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Membership</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Status</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4">Joined</TableHead>
                                    <TableHead className="text-xs font-black uppercase tracking-widest text-slate-400 p-4 text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockMembers.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        onClick={() => navigate(`/members/${member.id}`)}
                                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group"
                                    >
                                        <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedMembers.includes(member.id)}
                                                onCheckedChange={() => toggleMemberSelection(member.id)}
                                                className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600"
                                            />
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-95">
                                                    <AvatarImage src={member.profilePhoto || undefined} />
                                                    <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                                                        {member.firstName[0]}{member.lastName[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                                        {member.firstName} {member.lastName}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-400 group-hover:text-slate-500">{member.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                                {member.memberNumber}
                                            </span>
                                        </TableCell>
                                        <TableCell className="p-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                                            {member.phone}
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <Badge variant="outline" className="font-black text-[10px] uppercase tracking-wider rounded-lg border-indigo-100 text-indigo-600 bg-indigo-50/30">
                                                {member.membershipType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <Badge className={cn("font-black text-[10px] uppercase tracking-widest rounded-lg border shadow-none px-2", statusColors[member.status as keyof typeof statusColors])}>
                                                {member.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="p-4 text-xs font-bold text-slate-500">
                                            {new Date(member.joinDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell className="p-4 text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="p-2 w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/members/${member.id}`); }}
                                                        className="p-3 rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer text-sm font-medium"
                                                    >
                                                        View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer text-sm font-medium">
                                                        Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer text-sm font-medium">
                                                        Billing History
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                                                    <DropdownMenuItem className="p-3 rounded-xl focus:bg-rose-50 dark:focus:bg-rose-500/10 text-rose-600 dark:text-rose-400 cursor-pointer text-sm font-bold">
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
                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/50">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-slate-900 dark:text-white">{mockMembers.length}</span> of <span className="text-slate-900 dark:text-white">{mockMembers.length}</span> members
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="h-10 px-4 rounded-xl border-slate-200 font-bold text-xs"
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled
                                className="h-10 px-4 rounded-xl border-slate-200 font-bold text-xs"
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
