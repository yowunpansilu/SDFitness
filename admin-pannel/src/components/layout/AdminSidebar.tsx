import { NavLink } from 'react-router-dom';
import {
  type LucideIcon,
  LayoutDashboard,
  Users,
  Dumbbell,
  CreditCard,
  Calendar,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Store,
  MessageSquareQuote,
  MessageCircle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type NavItem = { name: string; href: string; icon: LucideIcon; exact?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const navigationGoups: NavGroup[] = [
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
      { name: 'Workouts', href: '/workouts', icon: Activity },
      { name: 'Membership Plans', href: '/plans', icon: CreditCard },
      { name: 'Classes', href: '/classes', icon: Calendar },
      { name: 'Messages', href: '/messages', icon: MessageCircle },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Equipment', href: '/equipment', icon: Package },
      { name: 'Payments', href: '/payments', icon: CreditCard },
      { name: 'Subscriptions', href: '/subscriptions', icon: RefreshCw },
    ]
  },
  {
    title: 'Market Intelligence',
    items: [
      { name: 'Food Prices', href: '/prices', icon: Store },
      { name: 'Scraper Review', href: '/scraper/review', icon: MessageSquareQuote },
      { name: 'Feedback & Bugs', href: '/feedback', icon: MessageCircle },
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
    <div className="flex h-full flex-col bg-navy-950 border-r border-navy-900 transition-colors duration-200">
      {/* Logo/Brand */}
      <div className="flex h-20 items-center px-6 border-b border-navy-900/50 bg-navy-950/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-950/50 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
              SD <span className="text-indigo-400">Fitness</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-navy-400">Admin Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 overflow-y-auto scrollbar-thin scrollbar-thumb-navy-800 scrollbar-track-transparent space-y-10">
        {navigationGoups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.25em] text-navy-500/80">
              {group.title}
            </h3>
            <div className="space-y-1.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.exact}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-300 group relative',
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 ring-1 ring-white/10'
                          : 'text-navy-300/90 hover:text-white hover:bg-navy-800/80'
                      )
                    }
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] transition-all duration-300 group-hover:scale-110 drop-shadow-sm',
                      )}
                    />
                    <span className="tracking-wide">{item.name}</span>
                    <div className={cn(
                      "absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-400 scale-0 transition-transform duration-300",
                      "group-hover:scale-100"
                    )} />
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="p-5 border-t border-navy-900 bg-navy-950/80">
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-navy-900/40 hover:bg-navy-900/60 transition-all duration-300 group cursor-pointer group shadow-sm">
          <Avatar className="h-10 w-10 border-2 border-indigo-500/30 group-hover:border-indigo-400/50 shadow-md">
            <AvatarImage src={user?.profilePhoto} alt={user?.firstName} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-white truncate tracking-tight uppercase">
              {user?.firstName} {user?.lastName}
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] text-navy-400 font-black uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9 text-navy-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors rounded-xl"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
