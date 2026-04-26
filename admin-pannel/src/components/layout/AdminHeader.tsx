import { Menu, Bell, Search, Moon, Sun } from 'lucide-react';
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
import { useTheme } from '@/lib/contexts/ThemeContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
    : 'AD';

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/50 bg-white/80 dark:bg-navy-950/80 dark:border-navy-900 backdrop-blur-xl transition-all duration-300">
      <div className="flex h-20 items-center justify-between gap-4 px-8">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-navy-500 hover:text-navy-900 hover:bg-navy-50 dark:hover:bg-navy-900 dark:hover:text-white"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-navy-400 group-focus-within:text-indigo-600 transition-colors" />
              <Input
                type="search"
                placeholder="Find anything: members, trainers, equipment..."
                className="w-full pl-11 pr-4 h-11 bg-navy-50/50 dark:bg-navy-900/50 border-transparent focus:bg-white dark:focus:bg-navy-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-xl transition-all duration-300 font-medium dark:text-white dark:placeholder:text-navy-400"
              />
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 text-navy-500 hover:text-navy-900 hover:bg-navy-50 dark:text-navy-400 dark:hover:text-white dark:hover:bg-navy-900 rounded-xl transition-all duration-300"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 text-navy-500 hover:text-navy-900 hover:bg-navy-50 dark:text-navy-400 dark:hover:text-white dark:hover:bg-navy-900 rounded-xl transition-all duration-300"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-navy-950 animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 p-2 bg-white dark:bg-navy-950 border-navy-100/50 dark:border-navy-900 rounded-2xl shadow-2xl"
            >
              <div className="px-3 py-2 border-b border-navy-50 dark:border-navy-900 mb-2">
                <h3 className="text-sm font-bold text-navy-900 dark:text-white">Notifications</h3>
              </div>
              <div className="space-y-1">
                {[
                  { title: 'New Registration', time: '5m ago', desc: 'John Doe joined as a member' },
                  { title: 'Payment Received', time: '1h ago', desc: 'Membership renewal for Jane Doe' },
                ].map((n, i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start gap-1 p-3 rounded-xl focus:bg-navy-50 dark:focus:bg-navy-900 cursor-pointer">
                    <div className="flex w-full justify-between">
                      <p className="text-sm font-bold text-navy-900 dark:text-white">{n.title}</p>
                      <span className="text-[10px] text-navy-400 font-medium">{n.time}</span>
                    </div>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{n.desc}</p>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="bg-navy-50 dark:bg-navy-900 my-2" />
              <DropdownMenuItem className="justify-center text-xs font-bold text-indigo-600 rounded-xl hover:bg-navy-50 dark:hover:bg-navy-900 cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-8 w-px bg-navy-100 dark:bg-navy-900 mx-1 hidden sm:block" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-12 pl-1 pr-3 gap-3 hover:bg-navy-50 dark:hover:bg-navy-900 rounded-xl transition-all duration-300 group"
              >
                <Avatar className="h-10 w-10 border-2 border-white dark:border-navy-950 shadow-sm transition-transform group-hover:scale-95">
                  <AvatarImage src={user?.profilePhoto} alt={user?.firstName} />
                  <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-bold text-navy-900 dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400 group-hover:text-indigo-500 transition-colors">
                    {user?.role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 p-2 bg-white dark:bg-navy-950 border-navy-100/50 dark:border-navy-900 rounded-2xl shadow-2xl"
            >
              <DropdownMenuItem className="p-3 rounded-xl focus:bg-navy-50 dark:focus:bg-navy-900 cursor-pointer dark:text-white">
                <span className="text-sm font-medium">Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 rounded-xl focus:bg-navy-50 dark:focus:bg-navy-900 cursor-pointer dark:text-white">
                <span className="text-sm font-medium">Preferences</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-navy-50 dark:bg-navy-900 my-2" />
              <DropdownMenuItem
                onClick={logout}
                className="p-3 rounded-xl text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10 cursor-pointer"
              >
                <span className="text-sm font-bold">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
