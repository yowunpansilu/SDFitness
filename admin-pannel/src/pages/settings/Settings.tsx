import { useState, useEffect } from 'react';
import { Building2, Mail, Bell, Shield, Save, AlertCircle } from 'lucide-react';
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
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        System <span className="text-indigo-600 italic">Configuration</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Orchestrate organizational parameters, communication protocols and security matrices.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {hasUnsavedChanges && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 animate-pulse">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending Changes</span>
                        </div>
                    )}

                    <Button
                        variant="ghost"
                        onClick={handleDiscardChanges}
                        disabled={!hasUnsavedChanges || isLoading}
                        className="h-11 px-6 rounded-xl font-black uppercase text-xs tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-30"
                    >
                        Discard
                    </Button>

                    <Button
                        onClick={handleSaveSettings}
                        disabled={!hasUnsavedChanges || isLoading}
                        className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95 disabled:grayscale disabled:opacity-50"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Syncing...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                <span>Commit Changes</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-10">
                <div className="p-1 w-fit bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <TabsList className="bg-transparent gap-1">
                        <TabsTrigger value="general" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-black uppercase text-[10px] tracking-widest text-slate-500 transition-all">
                            <Building2 className="h-3.5 w-3.5 mr-2" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="email" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-black uppercase text-[10px] tracking-widest text-slate-500 transition-all">
                            <Mail className="h-3.5 w-3.5 mr-2" />
                            Templates
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-black uppercase text-[10px] tracking-widest text-slate-500 transition-all">
                            <Bell className="h-3.5 w-3.5 mr-2" />
                            Alerts
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm font-black uppercase text-[10px] tracking-widest text-slate-500 transition-all">
                            <Shield className="h-3.5 w-3.5 mr-2" />
                            Security
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <TabsContent value="general" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <GeneralSettings />
                    </TabsContent>

                    <TabsContent value="email" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <EmailTemplates />
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <NotificationSettings />
                    </TabsContent>

                    <TabsContent value="roles" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        <RolesPermissions />
                    </TabsContent>
                </div>
            </Tabs>

            {/* Unsaved Changes Warning Dialog */}
            <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
                <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-8 max-w-md">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="h-20 w-20 rounded-[2rem] bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
                            <AlertCircle className="h-10 w-10" />
                        </div>
                        <div className="space-y-2">
                            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Uncommitted Data</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500 font-medium italic">
                                You have pending configuration changes. Leaving this matrix will result in permanent data loss.
                            </AlertDialogDescription>
                        </div>
                        <div className="flex items-center gap-3 w-full">
                            <AlertDialogCancel
                                onClick={handleCancelWarning}
                                className="flex-1 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 border-none text-slate-600 font-black uppercase text-xs tracking-widest transition-all"
                            >
                                Stay Here
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDiscardChanges}
                                className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-200 dark:shadow-none transition-all"
                            >
                                Discard
                            </AlertDialogAction>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
