import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Dumbbell,
    CreditCard,
    Calendar,
    Package,
    BarChart3,
    Settings,
    Megaphone,
    HeadphonesIcon,
    LogOut,
    Brain,
    Tag,
    ScanSearch,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Members', href: '/admin/members', icon: Users },
    { name: 'Trainers', href: '/admin/trainers', icon: Dumbbell },
    { name: 'Membership Plans', href: '/admin/plans', icon: CreditCard },
    { name: 'Classes', href: '/admin/classes', icon: Calendar },
    { name: 'Equipment', href: '/admin/equipment', icon: Package },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { name: 'Support', href: '/admin/support', icon: HeadphonesIcon },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const aiNavigation = [
    { name: 'ML Dashboard', href: '/admin/ml-dashboard', icon: Brain },
    { name: 'Food Prices', href: '/admin/food-prices', icon: Tag },
    { name: 'Scraper Review', href: '/admin/scraper-review', icon: ScanSearch },
];

export function AdminSidebar() {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
    };

    const userInitials = user
        ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
        : 'AD';

    return (
        <div className="flex h-full flex-col bg-gradient-to-b from-dark-900 to-dark-950 border-r border-dark-800">
            {/* Logo/Brand */}
            <div className="flex h-16 items-center justify-center px-6 border-b border-dark-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-white">SD Fitness</h1>
                        <p className="text-xs text-gray-400">Admin Panel</p>
                    </div>
                </div>
            </div>

            {/* User Profile Section */}
            <div className="p-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-dark-800/50 backdrop-blur-sm border border-dark-700 hover:bg-dark-800 transition-all duration-300">
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
                        <AvatarImage src={(user as any)?.profilePhoto} alt={user?.firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-semibold">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                    </div>
                </div>
            </div>

            <Separator className="bg-dark-800" />

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-700 scrollbar-track-transparent">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            end={item.exact}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                                    isActive
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-white shadow-lg shadow-purple-500/10'
                                        : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-600/10 animate-pulse" />
                                    )}
                                    <Icon
                                        className={cn(
                                            'h-5 w-5 transition-transform duration-200 group-hover:scale-110 relative z-10',
                                            isActive && 'text-purple-400'
                                        )}
                                    />
                                    <span className="relative z-10">{item.name}</span>
                                    {isActive && (
                                        <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-600 rounded-l-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* AI & Data Navigation */}
            <Separator className="bg-dark-800" />
            <div className="px-3 py-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">AI &amp; Data</p>
                <nav className="space-y-1">
                    {aiNavigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                                        isActive
                                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 text-white shadow-lg shadow-purple-500/10'
                                            : 'text-gray-400 hover:text-white hover:bg-dark-800/50'
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-600/10 animate-pulse" />
                                        )}
                                        <Icon className={cn('h-5 w-5 transition-transform duration-200 group-hover:scale-110 relative z-10', isActive && 'text-purple-400')} />
                                        <span className="relative z-10">{item.name}</span>
                                        {isActive && (
                                            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-600 rounded-l-full" />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <Separator className="bg-dark-800" />

            {/* Logout Button */}
            <div className="p-4">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start gap-3 text-gray-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-dark-700 transition-all duration-200"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </Button>
            </div>
        </div>
    );
}
