import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore } from "@/lib/stores/notificationStore";
import { NotificationItem } from "./NotificationItem";
import { CheckCheck, Trash2 } from "lucide-react";

interface Props {
    children: React.ReactNode;
}

export function NotificationSheet({ children }: Props) {
    const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll, unreadCount } = useNotificationStore();

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 h-full">
                <SheetHeader className="p-6 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Notifications ({unreadCount})</SheetTitle>
                        <SheetDescription className="sr-only">
                            Your recent activity and alerts
                        </SheetDescription>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAllAsRead()}
                                title="Mark all as read"
                                disabled={unreadCount === 0}
                            >
                                <CheckCheck className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => clearAll()}
                                title="Clear all"
                                disabled={notifications.length === 0}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 h-full">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-40">
                            <p>No notifications</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={markAsRead}
                                    onDelete={deleteNotification}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t bg-muted/20">
                    <Button variant="outline" className="w-full" asChild>
                        <a href="/dashboard/settings/notifications">Manage Settings</a>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
