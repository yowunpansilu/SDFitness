import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { MembershipPlan, BillingCycle } from "@/lib/api/membershipService";

interface PlanCardProps {
    plan: MembershipPlan;
    billingCycle: BillingCycle;
    isCurrent: boolean;
    onSelect: (planId: string) => void;
    isLoading?: boolean;
}

export function PlanCard({ plan, billingCycle, isCurrent, onSelect, isLoading }: PlanCardProps) {
    const price = billingCycle === 'monthly' ? (plan.monthlyPrice ?? plan.price) : (plan.yearlyPrice ?? (plan.price * 10));
    const period = billingCycle === 'monthly' ? '/mo' : '/yr';

    return (
        <Card className={`relative flex flex-col ${isCurrent ? 'border-primary shadow-md' : ''}`}>
            {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary hover:bg-primary">Most Popular</Badge>
                </div>
            )}

            <CardHeader>
                <div className="text-center">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>
                <div className="text-center mt-4">
                    <span className="text-3xl font-bold">Rs. {price.toLocaleString()}</span>
                    <span className="text-muted-foreground">{period}</span>
                    {plan.trialDays && (
                        <div className="mt-2">
                            <Badge variant="secondary" className="text-xs font-normal">
                                {plan.trialDays} Days Free Trial
                            </Badge>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>

            <CardFooter>
                <Button
                    className="w-full"
                    variant={isCurrent ? "outline" : "default"}
                    disabled={isCurrent || isLoading}
                    onClick={() => onSelect(plan.id)}
                >
                    {isCurrent ? "Current Plan" : "Select Plan"}
                </Button>
            </CardFooter>
        </Card>
    );
}
