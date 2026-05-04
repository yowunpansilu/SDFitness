import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet';
import { useAuthStore } from '@/lib/stores/authStore';

import { BottomNavBar } from '../navigation/BottomNavBar';

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { token, fetchProfile } = useAuthStore();

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
        // Only run on mount or when token changes
    }, [token]);

    return (
        <div className="min-h-screen bg-dark-950 pb-16 lg:pb-0">
            {/* Desktop sidebar */}
            <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
                <Sidebar />
            </aside>

            {/* Mobile sidebar */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent side="left" className="p-0 w-64">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                        <SheetDescription>Access dashboard sections and settings</SheetDescription>
                    </SheetHeader>
                    <Sidebar />
                </SheetContent>
            </Sheet>

            {/* Main content */}
            <div className="lg:pl-64">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <main className="py-8 px-6 pb-[calc(4rem+env(safe-area-inset-bottom)+2rem)] lg:pb-8">
                    <React.Suspense fallback={
                        <div className="flex h-[50vh] items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                    }>
                        <Outlet />
                    </React.Suspense>
                </main>
            </div>
            
            <BottomNavBar />
        </div>
    );
}
