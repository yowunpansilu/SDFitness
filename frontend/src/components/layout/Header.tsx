import { Menu, Bell, LogOut, Settings, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = () => {
        if (!user) return 'U';
        return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    };

    return (
        <header className="sticky top-0 z-40 border-b border-dark-700 bg-dark-900/95 backdrop-blur supports-[backdrop-filter]:bg-dark-900/60">
            <div className="flex h-16 items-center gap-4 px-6">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-gray-400 hover:text-white"
                    onClick={onMenuClick}
                >
                    <Menu className="h-6 w-6" />
                </Button>

                {/* Page title or breadcrumbs */}
                <div className="flex-1">
                    <h1 className="text-xl font-headline font-bold text-white">
                        Welcome back, {user?.firstName}!
                    </h1>
                </div>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
                            <Bell className="h-5 w-5" />
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                            >
                                3
                            </Badge>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-96 overflow-y-auto">
                            <DropdownMenuItem>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">Class Reminder</p>
                                    <p className="text-xs text-gray-400">
                                        Your HIIT class starts in 1 hour
                                    </p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">Payment Due</p>
                                    <p className="text-xs text-gray-400">
                                        Your membership renewal is due in 3 days
                                    </p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">New Message</p>
                                    <p className="text-xs text-gray-400">
                                        Your trainer sent you a message
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar>
                                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                                <AvatarFallback>{getInitials()}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs leading-none text-gray-400">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
