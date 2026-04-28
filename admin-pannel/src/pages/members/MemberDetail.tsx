import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Calendar, CreditCard, Activity, Loader2 } from 'lucide-react';
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
import { memberService } from '@/services/memberService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusColors = {
  active: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
  inactive: 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-navy-400 border-slate-200 dark:border-navy-700',
  suspended: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900',
  frozen: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900',
};

export function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [member, setMember] = useState<{
    _id: string;
    memberNumber?: string;
    joinDate: string;
    status: string;
    fitnessGoals?: string[];
    medicalConditions?: string[];
    emergencyContact?: { name: string; relationship: string; phoneNumber: string };
    height?: { value: number; unit: string };
    currentWeight?: { value: number; unit: string };
    targetWeight?: { value: number; unit: string };
    bodyFatPercentage?: number;
    dateOfBirth?: string;
    dietaryPreferences?: string[];
    userId?: { firstName: string; lastName: string; email: string; phone?: string; role?: string; avatar?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await memberService.getMemberDetails(id);
        if (response.success) {
          setMember(response.data);
        }
      } catch (error) {
        console.error('Error fetching member details:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch member details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!member || !confirm(`Are you sure you want to delete ${member.userId?.firstName}?`)) return;

    try {
      const response = await memberService.deleteMember(member._id);
      if (response.success) {
        toast({
          title: 'Member Deleted',
          description: 'The member has been removed successfully.',
        });
        navigate('/members');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete member.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-slate-500 dark:text-navy-400 font-bold uppercase tracking-widest text-xs">Loading Member Details...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 dark:text-navy-400 font-bold">Member not found.</p>
        <Button variant="link" className="text-indigo-600 dark:text-indigo-400" onClick={() => navigate('/members')}>Back to List</Button>
      </div>
    );
  }

  const userData = member.userId || ({} as { firstName?: string; lastName?: string; email?: string; phone?: string; role?: string; avatar?: string });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/members')}
            className="h-12 w-12 rounded-2xl border-slate-200 dark:border-navy-800 text-slate-400 dark:text-navy-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-100 dark:hover:border-navy-700 hover:bg-indigo-50 dark:hover:bg-navy-800 transition-all shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Member <span className="text-indigo-600 dark:text-indigo-400">Profile</span>
            </h1>
            <p className="text-slate-500 dark:text-navy-500 font-medium mt-1 uppercase text-xs tracking-widest transition-colors">
              {member.memberNumber || 'UNASSIGNED ID'} • Joined {new Date(member.joinDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none h-11 px-6 rounded-xl border-slate-200 dark:border-navy-800 font-bold text-slate-600 dark:text-navy-300 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex-1 md:flex-none h-11 px-6 rounded-xl border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-800 font-bold transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      </div>

      {/* Main Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lateral Card: Profile Summary */}
        <Card className="lg:col-span-1 bg-white dark:bg-navy-900 border-navy-100/50 dark:border-navy-800 shadow-sm rounded-[2.5rem] overflow-hidden transition-colors">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <Avatar className="h-40 w-40 border-8 border-slate-50 dark:border-navy-950 shadow-inner">
                <AvatarImage src={userData.avatar || undefined} />
                <AvatarFallback className="bg-indigo-600 dark:bg-indigo-500 text-white text-5xl font-bold">
                  {(userData.firstName || 'U')[0]}{(userData.lastName || '')[0]}
                </AvatarFallback>
              </Avatar>
              <Badge className={cn("absolute bottom-2 right-2 px-4 py-1.5 rounded-full border-4 border-white dark:border-navy-900 font-bold text-xs uppercase tracking-widest shadow-lg transition-colors", statusColors[member.status as keyof typeof statusColors])}>
                {member.status}
              </Badge>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 transition-colors">
              {userData.firstName} {userData.lastName}
            </h2>
            <p className="text-slate-400 dark:text-navy-500 font-bold uppercase text-xs tracking-wider mb-8 transition-colors">
              {userData.role || 'Member'}
            </p>

            <div className="w-full space-y-4 pt-8 border-t border-slate-100 dark:border-navy-800 transition-colors">
              <div className="flex items-center gap-4 text-left group">
                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-navy-950 flex items-center justify-center text-slate-400 dark:text-navy-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Email Address</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-navy-200 transition-colors">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left group">
                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-navy-950 flex items-center justify-center text-slate-400 dark:text-navy-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Phone Number</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-navy-200 transition-colors">{userData.phone || 'Not Provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left group">
                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-navy-950 flex items-center justify-center text-slate-400 dark:text-navy-600 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-navy-200 transition-colors">
                    {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Membership & Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-indigo-600 dark:bg-indigo-700 text-white rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-navy-950/20 border-none overflow-hidden relative transition-colors">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <CreditCard className="h-24 w-24" />
              </div>
              <CardContent className="p-8">
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">Current Tier</p>
                <h3 className="text-4xl font-bold mb-4">Standard <span className="text-indigo-900/30 dark:text-white/10">Plan</span></h3>
                <div className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-bold leading-none">Valid until Dec 2026</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 dark:bg-navy-950 text-white rounded-3xl border-none overflow-hidden relative group transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent" />
              <CardContent className="p-8 relative">
                <div className="flex justify-between items-start mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-navy-600">Progress Analytics</p>
                  <Activity className="h-5 w-5 text-indigo-400" />
                </div>
                <p className="text-xl font-bold leading-snug">
                  {(member.fitnessGoals?.length || 0) > 0
                    ? `Working towards ${(member.fitnessGoals || [])[0].replace('_', ' ')}`
                    : 'No fitness data recorded'
                  }
                </p>
                <Button variant="link" className="text-indigo-400 dark:text-indigo-300 p-0 h-auto font-bold text-xs uppercase tracking-widest mt-4">View Analytics Report</Button>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Data Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white dark:bg-navy-900 p-1.5 rounded-2xl border border-slate-100 dark:border-navy-800 shadow-sm w-full md:w-auto h-auto transition-colors">
              <TabsTrigger value="overview" className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all">
                Overview
              </TabsTrigger>
              <TabsTrigger value="health" className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all">
                Health Info
              </TabsTrigger>
              <TabsTrigger value="billing" className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all">
                Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white dark:bg-navy-900 border-slate-100 dark:border-navy-800 rounded-3xl shadow-sm transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Emergency Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-navy-600 mb-1">Emergency Contact</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white transition-colors">{member.emergencyContact?.name || 'Not Recorded'}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-navy-500">{member.emergencyContact?.relationship || 'Contact'} • {member.emergencyContact?.phoneNumber || 'No Phone'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-navy-600 mb-2">Medical Notes</p>
                      <div className="flex flex-wrap gap-2">
                        {(member.medicalConditions?.length || 0) > 0 ? (
                          (member.medicalConditions || []).map((c: string) => (
                            <Badge key={c} variant="outline" className="rounded-lg border-rose-100 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold uppercase text-[11px] transition-colors">
                              {c}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm font-bold text-slate-400 dark:text-navy-600 transition-colors">No conditions reported</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-navy-900 border-slate-100 dark:border-navy-800 rounded-3xl shadow-sm transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      Fitness Goals
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(member.fitnessGoals?.length || 0) > 0 ? (
                        (member.fitnessGoals || []).map((goal: string) => (
                          <Badge key={goal} className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50 font-bold text-xs uppercase tracking-wider shadow-none transition-colors">
                            {goal.replace('_', ' ')}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm font-bold text-slate-400 dark:text-navy-600 transition-colors">No specific goals set</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Height', value: `${member.height?.value || '0'} ${member.height?.unit || 'cm'}`, color: 'blue' },
                  { label: 'Weight', value: `${member.currentWeight?.value || '0'} ${member.currentWeight?.unit || 'kg'}`, color: 'emerald' },
                  { label: 'Target', value: `${member.targetWeight?.value || '--'} kg`, color: 'violet' },
                  { label: 'Body Fat', value: `${member.bodyFatPercentage || '--'}%`, color: 'amber' }
                ].map((stat) => (
                  <Card key={stat.label} className="bg-white dark:bg-navy-900 border-slate-100 dark:border-navy-800 rounded-2xl shadow-sm hover:border-indigo-100 dark:hover:border-navy-700 transition-colors">
                    <CardContent className="p-4 pt-6">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400 dark:text-navy-600 mb-1">{stat.label}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white transition-colors">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-slate-50 dark:bg-navy-950 border-none rounded-3xl transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-white dark:bg-navy-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors">
                      <Activity className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Dietary Information</h3>
                      <p className="text-xs font-bold text-slate-500 dark:text-navy-500 uppercase tracking-widest transition-colors">Preferences & Restrictions</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(member.dietaryPreferences?.length || 0) > 0 ? (
                      (member.dietaryPreferences || []).map((pref: string) => (
                        <Badge key={pref} className="px-4 py-2 rounded-xl bg-white dark:bg-navy-900 text-slate-700 dark:text-navy-200 border-slate-200 dark:border-navy-800 font-bold text-xs shadow-none transition-colors">
                          {pref.replace('_', ' ')}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm font-bold text-slate-400 dark:text-navy-600 transition-colors">No dietary preferences recorded</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card className="bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm rounded-3xl overflow-hidden transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-navy-600">Transaction History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50 dark:bg-navy-950/50 border-y border-slate-100 dark:border-navy-800 transition-colors">
                        <TableHead className="font-bold text-xs uppercase tracking-widest pl-8 text-slate-700 dark:text-navy-400">Reference</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-navy-400">Amount</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-widest text-slate-700 dark:text-navy-400">Status</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-widest text-right pr-8 text-slate-700 dark:text-navy-400">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="border-b border-slate-50 dark:border-navy-950 group transition-colors">
                        <TableCell className="pl-8 font-bold text-slate-700 dark:text-navy-300">#TR-89021</TableCell>
                        <TableCell className="font-bold text-slate-900 dark:text-white">LKR 25,000</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 font-bold text-[11px] uppercase tracking-widest shadow-none">Paid</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8 font-bold text-slate-400 dark:text-navy-600 group-hover:text-slate-600 dark:group-hover:text-navy-300 transition-colors">Oct 24, 2024</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="p-12 text-center">
                    <p className="text-sm font-bold text-slate-400 dark:text-navy-600 transition-colors">No further transaction history available.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
