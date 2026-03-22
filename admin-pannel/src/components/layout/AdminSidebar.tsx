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
    LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navigationGoups = [
    {
        title: 'Main',
        items: [
            { name: 'Dashboard', href: '/', icon: LayoutDashboard, exact: true },
            { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        ]
    },
    {
        title: 'Management',
        items: [
            { name: 'Members', href: '/members', icon: Users },
            { name: 'Trainers', href: '/trainers', icon: Dumbbell },
            { name: 'Membership Plans', href: '/plans', icon: CreditCard },
            { name: 'Classes', href: '/classes', icon: Calendar },
        ]
    },
    {
        title: 'Operations',
        items: [
            { name: 'Equipment', href: '/equipment', icon: Package },
            { name: 'Payments', href: '/payments', icon: CreditCard },
        ]
    },
    {
        title: 'System',
        items: [
            { name: 'Settings', href: '/settings', icon: Settings },
        ]
    }
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
        <div className="flex h-full flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-colors duration-200">
            {/* Logo/Brand */}
            <div className="flex h-20 items-center px-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Dumbbell className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SD Fitness</h1>
                        <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Management Suite</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent space-y-8">
                {navigationGoups.map((group) => (
                    <div key={group.title} className="space-y-2">
                        <h3 className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        end={item.exact}
                                        className={({ isActive }) =>
                                            cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative',
                                                isActive
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100/50 dark:border-indigo-500/20'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/50'
                                            )
                                        }
                                    >
                                        <Icon
                                            className={cn(
                                                'h-[18px] w-[18px] transition-all duration-300 group-hover:scale-110',
                                            )}
                                        />
                                        <span>{item.name}</span>
                                        {/* Indicator for active state */}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group cursor-pointer">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-900 shadow-sm">
                        <AvatarImage src={user?.profilePhoto} alt={user?.firstName} />
                        <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
