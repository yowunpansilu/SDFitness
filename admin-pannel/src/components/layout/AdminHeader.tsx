import { Menu, Bell, Search, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
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
        <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-dark-800 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-dark-900/75 shadow-sm transition-colors duration-200">
            <div className="flex h-16 items-center gap-4 px-6">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search members, trainers, classes..."
                            className="pl-10 bg-gray-50 dark:bg-dark-800/50 border-gray-200 dark:border-dark-700 focus:border-purple-500/50 focus:ring-purple-500/20 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                        className="text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-dark-800 transition-all duration-200"
                    >
                        {theme === 'dark' ? (
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
                                className="relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-800 transition-all duration-200"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 ring-2 ring-white dark:ring-dark-900 animate-pulse" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-80 bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white shadow-lg"
                        >
                            <DropdownMenuLabel className="text-sm font-semibold">
                                Notifications
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-dark-700" />
                            <div className="max-h-96 overflow-y-auto">
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-gray-100 dark:focus:bg-dark-800 cursor-pointer">
                                    <p className="text-sm font-medium">New member registration</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">John Doe signed up 5 minutes ago</p>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-gray-100 dark:focus:bg-dark-800 cursor-pointer">
                                    <p className="text-sm font-medium">Payment received</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">$99.00 from Jane Smith</p>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-gray-100 dark:focus:bg-dark-800 cursor-pointer">
                                    <p className="text-sm font-medium">Equipment maintenance due</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Treadmill #3 needs service</p>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-dark-700" />
                            <DropdownMenuItem className="justify-center text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 focus:bg-gray-100 dark:focus:bg-dark-800 cursor-pointer">
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="gap-2 hover:bg-gray-100 dark:hover:bg-dark-800 transition-all duration-200"
                            >
                                <Avatar className="h-8 w-8 ring-2 ring-purple-500/20">
                                    <AvatarImage src={user?.profilePhoto} alt={user?.firstName} />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs font-semibold">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 bg-white dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-900 dark:text-white shadow-lg"
                        >
                            <DropdownMenuLabel className="text-xs text-gray-500 dark:text-gray-400">
                                My Account
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-dark-700" />
                            <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-dark-800 cursor-pointer">
                                Profile Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-dark-800 cursor-pointer">
                                Preferences
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-200 dark:bg-dark-700" />
                            <DropdownMenuItem
                                onClick={logout}
                                className="text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-300 cursor-pointer"
                            >
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
