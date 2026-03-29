import { useState, useEffect } from 'react';
import { User, Heart, Target, Settings, AlertTriangle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalInfoTab } from '@/components/profile/PersonalInfoTab';
import { HealthMetricsTab } from '@/components/profile/HealthMetricsTab';
import { GoalsTab } from '@/components/profile/GoalsTab';
import { PreferencesTab } from '@/components/profile/PreferencesTab';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from '@/lib/api/axios';

export function Profile() {
    const { token, logout, fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                if (token && fetchProfile) {
                    await fetchProfile();
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (token) {
            loadProfile();
        }
    }, [token, fetchProfile]);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await api.delete('/auth/profile');

            if (response.data.success) {
                logout();
                navigate('/login');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

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

            {/* Danger Zone */}
            <Card className="border-destructive/20 bg-destructive/5 mt-10">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                <h3 className="font-headline font-bold">Danger Zone</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button 
                                    variant="destructive" 
                                    className="gap-2"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-background border-border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-muted-foreground">
                                        This action cannot be undone. This will permanently delete your
                                        account and remove your health data, fitness goals, and progress
                                        from our servers.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-muted text-foreground hover:bg-muted/80">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                        onClick={handleDeleteAccount}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Yes, Delete My Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
