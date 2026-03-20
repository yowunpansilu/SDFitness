import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard } from "lucide-react";
import type { UserMembership, MembershipPlan } from "@/lib/api/membershipService";
import { format } from "date-fns";

interface MembershipStatusCardProps {
    membership: UserMembership;
    plan?: MembershipPlan;
    onManage: () => void;
}

export function MembershipStatusCard({ membership, plan, onManage }: MembershipStatusCardProps) {
    const statusColors = {
        active: "bg-green-500 hover:bg-green-600",
        expired: "bg-red-500 hover:bg-red-600",
        cancelled: "bg-orange-500 hover:bg-orange-600",
        frozen: "bg-blue-500 hover:bg-blue-600",
    };

    return (
        <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border">
                <CardTitle className="text-lg font-bold text-foreground">Current Membership</CardTitle>
                <Badge className={`${statusColors[membership.status]} text-foreground`}>
                    {membership.status.toUpperCase()}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row justify-between gap-6 pt-4">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Plan</p>
                            <p className="text-2xl font-bold text-foreground">{plan?.name || "Loading..."}</p>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {membership.status === 'active' ? 'Renews on ' : 'Expires on '}
                                {format(new Date(membership.endDate), "MMMM d, yyyy")}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Billing</p>
                            <div className="flex items-center gap-2 mt-1 text-foreground">
                                <CreditCard className="h-4 w-4" />
                                <span className="font-medium">
                                    {membership.paymentMethod?.brand} •••• {membership.paymentMethod?.last4}
                                </span>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" onClick={onManage} className="bg-transparent border-border text-foreground hover:bg-muted hover:text-foreground w-full md:w-auto">
                            Manage Subscription
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
