import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Mail, Smartphone } from "lucide-react";

export function NotificationSettings() {
    const [preferences, setPreferences] = useState({
        email: {
            marketing: false,
            security: true,
            updates: true
        },
        push: {
            reminders: true,
            messages: true,
            promotions: false
        }
    });

    const handleToggle = (category: 'email' | 'push', type: string) => {
        setPreferences(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                // @ts-ignore
                [type]: !prev[category][type]
            }
        }));
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage how you receive notifications and updates.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        <CardTitle>Email Notifications</CardTitle>
                    </div>
                    <CardDescription>
                        Choose what emails you'd like to receive.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="marketing-email" className="flex flex-col space-y-1">
                            <span>Marketing Emails</span>
                            <span className="font-normal text-xs text-muted-foreground">Receive offers and promotions.</span>
                        </Label>
                        <Switch
                            id="marketing-email"
                            checked={preferences.email.marketing}
                            onCheckedChange={() => handleToggle('email', 'marketing')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="security-email" className="flex flex-col space-y-1">
                            <span>Security Alerts</span>
                            <span className="font-normal text-xs text-muted-foreground">Get notified about login attempts and password changes.</span>
                        </Label>
                        <Switch
                            id="security-email"
                            checked={preferences.email.security}
                            disabled
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="updates-email" className="flex flex-col space-y-1">
                            <span>Product Updates</span>
                            <span className="font-normal text-xs text-muted-foreground">News about new features and improvements.</span>
                        </Label>
                        <Switch
                            id="updates-email"
                            checked={preferences.email.updates}
                            onCheckedChange={() => handleToggle('email', 'updates')}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <CardTitle>Push Notifications</CardTitle>
                    </div>
                    <CardDescription>
                        Manage mobile and web push notifications.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="reminders-push" className="flex flex-col space-y-1">
                            <span>Class Reminders</span>
                            <span className="font-normal text-xs text-muted-foreground">Get notified 1 hour before your booked class.</span>
                        </Label>
                        <Switch
                            id="reminders-push"
                            checked={preferences.push.reminders}
                            onCheckedChange={() => handleToggle('push', 'reminders')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="messages-push" className="flex flex-col space-y-1">
                            <span>Messages</span>
                            <span className="font-normal text-xs text-muted-foreground">Receive notifications for new messages from trainers.</span>
                        </Label>
                        <Switch
                            id="messages-push"
                            checked={preferences.push.messages}
                            onCheckedChange={() => handleToggle('push', 'messages')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="promotions-push" className="flex flex-col space-y-1">
                            <span>Promotions</span>
                            <span className="font-normal text-xs text-muted-foreground">App-exclusive offers and deals.</span>
                        </Label>
                        <Switch
                            id="promotions-push"
                            checked={preferences.push.promotions}
                            onCheckedChange={() => handleToggle('push', 'promotions')}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button>Save Preferences</Button>
            </div>
        </div>
    );
}
