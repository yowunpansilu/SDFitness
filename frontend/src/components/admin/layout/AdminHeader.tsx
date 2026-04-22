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
import { useState } from 'react';

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { user, logout } = useAuthStore();
    const [isDark, setIsDark] = useState(true);

    const userInitials = user
        ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
        : 'AD';

    const toggleTheme = () => {
        setIsDark(!isDark);
        // Theme toggle logic here
    };

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
            <div className="flex h-16 items-center gap-4 px-6">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-card"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search members, trainers, classes..."
                            className="pl-10 bg-card/50 border-border focus:border-purple-500/50 focus:ring-purple-500/20 text-foreground placeholder:text-muted-foreground transition-all duration-200"
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
                        className="text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200"
                    >
                        {isDark ? (
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
                                className="relative text-muted-foreground hover:text-foreground hover:bg-card transition-all duration-200"
                            >
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 ring-2 ring-dark-900 animate-pulse" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-80 bg-background border-border text-foreground"
                        >
                            <DropdownMenuLabel className="text-sm font-semibold">
                                Notifications
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-muted" />
                            <div className="max-h-96 overflow-y-auto">
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-card cursor-pointer">
                                    <p className="text-sm font-medium">New member registration</p>
                                    <p className="text-xs text-muted-foreground">John Doe signed up 5 minutes ago</p>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-card cursor-pointer">
                                    <p className="text-sm font-medium">Payment received</p>
                                    <p className="text-xs text-muted-foreground">$99.00 from Jane Smith</p>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-card cursor-pointer">
                                    <p className="text-sm font-medium">Equipment maintenance due</p>
                                    <p className="text-xs text-muted-foreground">Treadmill #3 needs service</p>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem className="justify-center text-xs text-purple-400 hover:text-purple-300 focus:bg-card cursor-pointer">
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="gap-2 hover:bg-card transition-all duration-200"
                            >
                                <Avatar className="h-8 w-8 ring-2 ring-purple-500/20">
                                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-foreground text-xs font-semibold">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-medium text-foreground">
                                        {user?.firstName} {user?.lastName}
                                    </span>
                                    <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 bg-background border-border text-foreground"
                        >
                            <DropdownMenuLabel className="text-xs text-muted-foreground">
                                My Account
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem className="focus:bg-card cursor-pointer">
                                Profile Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem className="focus:bg-card cursor-pointer">
                                Preferences
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-muted" />
                            <DropdownMenuItem
                                onClick={logout}
                                className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
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
