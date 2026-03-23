import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Building2, Mail, Bell, Shield } from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { EmailTemplates } from './EmailTemplates';
import { NotificationSettings } from './NotificationSettings';
import { UserRoles } from './UserRoles';

export function Settings() {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/20">
                    <SettingsIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your gym's configuration and preferences
                    </p>
                </div>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-background border border-border">
                    <TabsTrigger
                        value="general"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-600/20 data-[state=active]:text-foreground"
                    >
                        <Building2 className="h-4 w-4 mr-2" />
                        General
                    </TabsTrigger>
                    <TabsTrigger
                        value="email"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-600/20 data-[state=active]:text-foreground"
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Templates
                    </TabsTrigger>
                    <TabsTrigger
                        value="notifications"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-600/20 data-[state=active]:text-foreground"
                    >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger
                        value="roles"
                        className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-600/20 data-[state=active]:text-foreground"
                    >
                        <Shield className="h-4 w-4 mr-2" />
                        User Roles
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <GeneralSettings />
                </TabsContent>

                <TabsContent value="email" className="space-y-6">
                    <EmailTemplates />
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                    <NotificationSettings />
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                    <UserRoles />
                </TabsContent>
            </Tabs>
        </div>
    );
}
