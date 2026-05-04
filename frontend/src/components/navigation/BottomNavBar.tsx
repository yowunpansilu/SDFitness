
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Utensils, Dumbbell, Calendar, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNavBar() {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', label: 'Home', icon: Home, exact: true },
        { path: '/dashboard/diet-plans', label: 'Diet', icon: Utensils },
        { path: '/dashboard/workouts', label: 'Workouts', icon: Dumbbell },
        { path: '/dashboard/classes', label: 'Classes', icon: Calendar },
        { path: '/dashboard/weight', label: 'Weight', icon: Scale },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-[env(safe-area-inset-bottom)] bg-white border-t border-primary-100 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
            <nav className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = item.exact 
                        ? location.pathname === item.path
                        : location.pathname.startsWith(item.path);

                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors min-h-[44px] min-w-[44px]",
                                isActive ? "text-primary-900" : "text-gray-400 hover:text-primary-600"
                            )}
                        >
                            <div className="relative flex items-center justify-center h-8 w-12">
                                {isActive && (
                                    <motion.div
                                        layoutId="bottomNavIndicator"
                                        className="absolute inset-0 bg-primary-100 rounded-full"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30
                                        }}
                                    />
                                )}
                                <Icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-[10px] font-medium relative z-10">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}
