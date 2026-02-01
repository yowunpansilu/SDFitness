import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { NotificationSheet } from "./NotificationSheet";
import { useEffect } from "react";

export function NotificationBell() {
    const { unreadCount, fetchNotifications } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return (
        <NotificationSheet>
            <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
                )}
                <span className="sr-only">Notifications</span>
            </Button>
        </NotificationSheet>
    );
}
