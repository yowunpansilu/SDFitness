import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/stores/authStore';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuthStore();

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : 'AD';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-300 bg-slate-50/80 backdrop-blur-xl transition-all duration-300">
      <div className="flex h-20 items-center justify-between gap-4 px-8">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-600 hover:text-slate-900 hover:bg-white"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 group-hover:text-indigo-500 transition-colors" />
              <Input
                type="search"
                placeholder="Search Matrix: members, analytics, inventory..."
                className="w-full pl-11 pr-4 h-11 bg-white border-2 border-slate-300 hover:border-slate-400 focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest text-slate-900 placeholder:text-slate-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 text-slate-600 hover:text-slate-900 hover:bg-white rounded-xl transition-all duration-300"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-200 animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 p-2 bg-slate-50 border-slate-300 rounded-2xl shadow-2xl"
            >
              <div className="px-3 py-2 border-b border-slate-300 mb-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Notifications</h3>
              </div>
              <div className="space-y-1">
                {[
                  { title: 'New Registration', time: '5m ago', desc: 'John Doe joined as a member' },
                  { title: 'Payment Received', time: '1h ago', desc: 'Membership renewal for Jane Doe' },
                ].map((n, i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 rounded-xl focus:bg-white cursor-pointer">
                    <div className="flex w-full justify-between">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{n.title}</p>
                      <span className="text-[10px] text-slate-700 font-bold uppercase">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-medium">{n.desc}</p>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-white my-2" />
              <DropdownMenuItem className="justify-center text-[10px] font-black uppercase tracking-widest text-indigo-600 rounded-xl hover:bg-white cursor-pointer">
                View all protocols
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-8 w-px bg-white mx-1 hidden sm:block" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 pl-1 pr-3 gap-3 hover:bg-white rounded-xl transition-all duration-300 group"
              >
                <Avatar className="h-10 w-10 border-2 border-slate-300 shadow-sm transition-transform group-hover:scale-95">
                  <AvatarImage src={user?.profilePhoto} alt={user?.firstName} />
                  <AvatarFallback className="bg-indigo-600 text-white text-xs font-black">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 group-hover:text-indigo-600 transition-colors">
                    {user?.role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-2 bg-slate-50 border-slate-300 rounded-2xl shadow-2xl"
            >
              <DropdownMenuItem className="p-3 rounded-xl focus:bg-white cursor-pointer text-slate-900">
                <span className="text-[10px] font-black uppercase tracking-widest">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 rounded-xl focus:bg-white cursor-pointer text-slate-900">
                <span className="text-[10px] font-black uppercase tracking-widest">Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white my-2" />
              <DropdownMenuItem
                onClick={logout}
                className="p-3 rounded-xl text-rose-500 focus:bg-rose-500/10 cursor-pointer"
              >
                <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
