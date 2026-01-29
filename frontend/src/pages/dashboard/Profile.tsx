import { User, Heart, Target, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalInfoTab } from '@/components/profile/PersonalInfoTab';
import { HealthMetricsTab } from '@/components/profile/HealthMetricsTab';
import { GoalsTab } from '@/components/profile/GoalsTab';
import { PreferencesTab } from '@/components/profile/PreferencesTab';

export function Profile() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-headline font-bold text-white">Profile Settings</h1>
                <p className="text-gray-400 mt-2">
                    Manage your personal information, health metrics, and preferences
                </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="personal" className="gap-2">
                        <User className="h-4 w-4" />
                        Personal Info
                    </TabsTrigger>
                    <TabsTrigger value="health" className="gap-2">
                        <Heart className="h-4 w-4" />
                        Health Metrics
                    </TabsTrigger>
                    <TabsTrigger value="goals" className="gap-2">
                        <Target className="h-4 w-4" />
                        Goals
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Preferences
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                    <PersonalInfoTab />
                </TabsContent>

                <TabsContent value="health">
                    <HealthMetricsTab />
                </TabsContent>

                <TabsContent value="goals">
                    <GoalsTab />
                </TabsContent>

                <TabsContent value="preferences">
                    <PreferencesTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
