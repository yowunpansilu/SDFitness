import { useState, useEffect } from 'react';
import { Building2, Mail, Bell, Shield, Save, X, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/lib/stores/settingsStore';
import { GeneralSettings } from './GeneralSettings';
import { EmailTemplates } from './EmailTemplates';
import { NotificationSettings } from './NotificationSettings';
import { RolesPermissions } from './RolesPermissions';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
    const [pendingTab, setPendingTab] = useState<string | null>(null);
    const { hasUnsavedChanges, isLoading, saveSettings, resetSettings, setUnsavedChanges } = useSettingsStore();
    const { toast } = useToast();

    // Warn before leaving if unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const handleTabChange = (newTab: string) => {
        if (hasUnsavedChanges) {
            setPendingTab(newTab);
            setShowUnsavedWarning(true);
        } else {
            setActiveTab(newTab);
        }
    };

    const handleDiscardChanges = () => {
        resetSettings();
        setUnsavedChanges(false);
        if (pendingTab) {
            setActiveTab(pendingTab);
            setPendingTab(null);
        }
        setShowUnsavedWarning(false);
        toast({
            title: 'Changes discarded',
            description: 'Your unsaved changes have been discarded.',
        });
    };

    const handleSaveSettings = async () => {
        try {
            await saveSettings();
            toast({
                title: 'Settings saved',
                description: 'Your settings have been saved successfully.',
                variant: 'default',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save settings. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleCancelWarning = () => {
        setShowUnsavedWarning(false);
        setPendingTab(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Settings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Manage your gym's configuration and preferences
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {hasUnsavedChanges && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-yellow-400">Unsaved changes</span>
                        </div>
                    )}

                    <Button
                        variant="outline"
                        onClick={handleDiscardChanges}
                        disabled={!hasUnsavedChanges || isLoading}
                        className="bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 shadow-sm"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Discard
                    </Button>

                    <Button
                        onClick={handleSaveSettings}
                        disabled={!hasUnsavedChanges || isLoading}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg shadow-purple-500/20"
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="general" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="email" className="gap-2">
                        <Mail className="h-4 w-4" />
                        Email Templates
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Roles & Permissions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <GeneralSettings />
                </TabsContent>

                <TabsContent value="email">
                    <EmailTemplates />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationSettings />
                </TabsContent>

                <TabsContent value="roles">
                    <RolesPermissions />
                </TabsContent>
            </Tabs>

            {/* Unsaved Changes Warning Dialog */}
            <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
                <AlertDialogContent className="bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-gray-900 dark:text-white">Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                            You have unsaved changes. Are you sure you want to leave this section? Your changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={handleCancelWarning}
                            className="bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-700"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDiscardChanges}
                            className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                        >
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
