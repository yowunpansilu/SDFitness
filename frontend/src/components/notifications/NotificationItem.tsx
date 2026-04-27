import { type Notification } from "@/lib/api/notificationService";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
    notification: Notification;
    onRead: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: Props) {
    const getIcon = () => {
        switch (notification.type) {
            case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <div
            className={cn(
                "flex gap-4 p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer",
                !notification.isRead && "bg-muted/30"
            )}
            onClick={() => onRead(notification._id)}
        >
            <div className="mt-1 flex-shrink-0">
                {getIcon()}
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                    <p className={cn("text-sm font-medium leading-none", !notification.isRead && "font-bold")}>
                        {notification.title}
                    </p>
                    {!notification.isRead && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {notification.message}
                </p>
                <p className="text-xs text-muted-foreground pt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}
