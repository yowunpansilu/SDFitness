import { useState, useEffect } from 'react';
import { User, Heart } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalInfoTab } from '@/components/profile/PersonalInfoTab';
import { HealthMetricsTab } from '@/components/profile/HealthMetricsTab';
import { useAuthStore } from '@/lib/stores/authStore';
import api from '@/lib/api/axios';

export function Profile() {
    const { token, login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                if (response.data.success && token) {
                    // Update the store with latest data
                    login(response.data.user, token, response.data.member);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            fetchProfile();
        }
    }, [token, API_URL, login]);



    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-headline font-bold text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your personal information and health metrics
                </p>
            </div>

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
                </TabsList>

                <TabsContent value="personal">
                    <PersonalInfoTab />
                </TabsContent>

                <TabsContent value="health">
                    <HealthMetricsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
