import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Mail, UserX, Plus, Loader2 } from 'lucide-react';
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
import { memberService } from '@/services/memberService';
import { useToast } from '@/hooks/use-toast';

interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  membershipType: string;
  joinDate: string;
  profilePhoto: string | null;
}

const statusColors = {
  active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
  inactive: 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-navy-400 border-slate-200 dark:border-navy-700',
  suspended: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
  frozen: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20',
};

export function MembersList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [membershipFilter, setMembershipFilter] = useState('all');
  const [sortBy, setSortBy] = useState('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await memberService.getMembers();
      if (response.success) {
        setMembers(response.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch members from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;

    try {
      const response = await memberService.deleteMember(id);
      if (response.success) {
        toast({
          title: 'Member Deleted',
          description: `${name} has been removed from the database.`,
        });
        setMembers(prev => prev.filter(m => m.id !== id));
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete member.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await memberService.updateMemberStatus(id, newStatus);
      if (response.success) {
        toast({
          title: 'Status Updated',
          description: `Member status has been set to ${newStatus}.`,
        });
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

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
        : filteredMembers.map(m => m.id)
    );
  };

  const filteredMembers = members
    .filter(member => {
      const matchesSearch = (member.firstName + ' ' + member.lastName + ' ' + member.email + ' ' + (member.memberNumber || ''))
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      const matchesMembership = membershipFilter === 'all' || member.membershipType.toLowerCase() === membershipFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesMembership;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = (a.firstName + a.lastName).localeCompare(b.firstName + b.lastName);
      } else if (sortBy === 'joinDate') {
        comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
      } else if (sortBy === 'memberNumber') {
        comparison = (a.memberNumber || '').localeCompare(b.memberNumber || '');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-navy-950 dark:text-white">
            Members <span className="text-navy-400 dark:text-navy-500">Management</span>
          </h1>
          <p className="text-navy-500 dark:text-navy-400 font-bold uppercase tracking-wider text-xs mt-2">
            Organize and maintain your fitness community.
          </p>
        </div>
        <Button
          onClick={() => navigate('/members/add')}
          className="bg-navy-900 dark:bg-indigo-600 hover:bg-navy-800 dark:hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-navy-100 dark:shadow-indigo-900/20 h-11 px-6 font-bold uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Member
        </Button>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 group-focus-within:text-navy-600 dark:group-focus-within:text-white transition-colors" />
              <Input
                placeholder="Search by name, email, or member number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 h-11 bg-navy-50/50 dark:bg-navy-950 border-transparent focus:bg-white dark:focus:bg-navy-900 focus:border-navy-500/50 focus:ring-4 focus:ring-navy-500/10 rounded-xl transition-all font-medium dark:text-white dark:placeholder:text-navy-500"
              />
            </div>

            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-11 bg-navy-50/50 dark:bg-navy-950 border-transparent rounded-xl focus:ring-indigo-500/10 font-bold text-xs dark:text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-navy-100 dark:border-navy-800 dark:bg-navy-950 dark:text-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              {/* Membership Type Filter */}
              <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                <SelectTrigger className="w-[140px] h-11 bg-navy-50/50 dark:bg-navy-950 border-transparent rounded-xl focus:ring-indigo-500/10 font-bold text-xs dark:text-white">
                  <SelectValue placeholder="Membership" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-navy-100 dark:border-navy-800 dark:bg-navy-950 dark:text-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="elite">Elite</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By Selector */}
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-11 bg-navy-50/50 dark:bg-navy-950 border-transparent rounded-xl focus:ring-indigo-500/10 font-bold text-xs dark:text-white">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-navy-100 dark:border-navy-800 dark:bg-navy-950 dark:text-white">
                    <SelectItem value="joinDate">Join Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="memberNumber">ID Number</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-xl bg-navy-50/50 dark:bg-navy-950 border-transparent text-navy-400 hover:text-indigo-600 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-800 transition-all font-bold"
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                >
                  <MoreVertical className={cn("h-4 w-4 transition-transform", sortOrder === 'desc' ? "rotate-180" : "")} />
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedMembers.length > 0 && (
            <div className="mt-6 flex items-center gap-4 p-3 bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 px-3">
                {selectedMembers.length} selected
              </span>
              <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-900" />
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-navy-800 font-bold text-xs rounded-lg transition-all">
                  <Mail className="h-3.5 w-3.5 mr-2" /> Email
                </Button>
                <Button size="sm" variant="ghost" className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold text-xs rounded-lg transition-all">
                  <UserX className="h-3.5 w-3.5 mr-2" /> Deactivate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Members Table */}
      <Card className="bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden min-h-[400px]">
        <CardHeader className="border-b border-navy-50 dark:border-navy-800/50 pb-6 flex flex-row items-center justify-between bg-navy-50/20 dark:bg-navy-950/20">
          <CardTitle className="text-navy-950 dark:text-white font-bold text-xl flex items-center gap-2 uppercase tracking-tight">
            Member List
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white dark:bg-navy-950 text-navy-500 dark:text-navy-400 border border-navy-100 dark:border-navy-800 shadow-sm">
              {filteredMembers.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
              <p className="text-navy-500 dark:text-navy-400 font-bold text-sm tracking-widest uppercase">Connecting to Database...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2">
              <p className="text-navy-400 dark:text-navy-500 font-bold">No members found matching your criteria.</p>
              <Button variant="link" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setMembershipFilter('all'); }} className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-widest">Clear Filters</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-navy-50 dark:border-navy-800 hover:bg-transparent">
                    <TableHead className="w-16 pl-6">
                      <Checkbox
                        checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                        onCheckedChange={toggleAllMembers}
                        className="rounded-md border-navy-200 dark:border-navy-800 data-[state=checked]:bg-indigo-600"
                      />
                    </TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-navy-400 dark:text-navy-500 p-4">Member Info</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-navy-400 dark:text-navy-500 p-4">ID Number</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-navy-400 dark:text-navy-500 p-4">Contact</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-navy-400 dark:text-navy-500 p-4">Membership</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-navy-400 dark:text-navy-500 p-4">Status</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-navy-400 dark:text-navy-500 p-4">Joined</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-widest text-navy-400 dark:text-navy-500 p-4 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow
                      key={member.id}
                      onClick={() => navigate(`/members/${member.id}`)}
                      className="border-b border-navy-50/50 dark:border-navy-800/50 hover:bg-navy-50/50 dark:hover:bg-navy-950/50 transition-all cursor-pointer group"
                    >
                      <TableCell className="pl-6" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => toggleMemberSelection(member.id)}
                          className="rounded-md border-navy-200 dark:border-navy-800 data-[state=checked]:bg-indigo-600"
                        />
                      </TableCell>
                      <TableCell className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border-2 border-white dark:border-navy-800 shadow-sm transition-transform group-hover:scale-95">
                            <AvatarImage src={member.profilePhoto || undefined} />
                            <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                              {member.firstName[0]}{member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-navy-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs font-medium text-navy-400 dark:text-navy-500 group-hover:text-navy-500">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-4">
                        <span className="text-xs font-bold text-navy-500 dark:text-navy-400 bg-navy-50 dark:bg-navy-950 px-2.5 py-1 rounded-md">
                          {member.memberNumber || 'UNASSIGNED'}
                        </span>
                      </TableCell>
                      <TableCell className="p-4 text-xs font-bold text-navy-600 dark:text-navy-400">
                        {member.phone || 'N/A'}
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge variant="outline" className="font-bold text-xs uppercase tracking-wider rounded-lg border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-500/5">
                          {member.membershipType}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4">
                        <Badge className={cn("font-bold text-xs uppercase tracking-widest rounded-lg border shadow-none px-2", statusColors[member.status as keyof typeof statusColors])}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-4 text-xs font-bold text-navy-500 dark:text-navy-400">
                        {new Date(member.joinDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="p-4 text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-navy-400 hover:text-indigo-600 dark:hover:text-white hover:bg-navy-50 dark:hover:bg-navy-800 rounded-xl transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="p-2 w-48 bg-white dark:bg-navy-950 border-navy-100 dark:border-navy-800 rounded-2xl shadow-xl">
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); navigate(`/members/${member.id}`); }}
                              className="p-3 rounded-xl focus:bg-navy-50 dark:focus:bg-navy-900 cursor-pointer text-sm font-medium dark:text-white"
                            >
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(member.id, member.status === 'active' ? 'inactive' : 'active'); }}
                              className="p-3 rounded-xl focus:bg-navy-50 dark:focus:bg-navy-900 cursor-pointer text-sm font-medium dark:text-white"
                            >
                              {member.status === 'active' ? 'Deactivate' : 'Activate'} Member
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-navy-50 dark:bg-navy-900 my-1" />
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); handleDeleteMember(member.id, `${member.firstName} ${member.lastName}`); }}
                              className="p-3 rounded-xl focus:bg-rose-50 dark:focus:bg-rose-500/10 text-rose-600 cursor-pointer text-sm font-bold"
                            >
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
          )}

          {/* Pagination */}
          {!loading && filteredMembers.length > 0 && (
            <div className="flex items-center justify-between p-6 bg-navy-50/10 dark:bg-navy-950/30">
              <p className="text-xs font-bold text-navy-500 dark:text-navy-400 uppercase tracking-widest">
                Showing <span className="text-navy-900 dark:text-white">{filteredMembers.length}</span> of <span className="text-navy-900 dark:text-white">{members.length}</span> members
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-10 px-4 rounded-xl border-navy-100 dark:border-navy-800 font-bold text-xs dark:bg-navy-900 dark:text-white"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-10 px-4 rounded-xl border-navy-100 dark:border-navy-800 font-bold text-xs dark:bg-navy-900 dark:text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
