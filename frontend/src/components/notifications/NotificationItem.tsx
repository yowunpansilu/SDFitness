import { type Notification } from "@/lib/api/notificationService";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";

interface Props {
    notification: Notification;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onRead, onDelete }: Props) {
    const getIcon = () => {
        switch (notification.type) {
            case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(notification.id);
    };

    return (
        <div
            className={cn(
                "group flex gap-4 p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer relative",
                !notification.isRead && "bg-muted/30"
            )}
            onClick={() => onRead(notification.id)}
        >
            <div className="mt-1 flex-shrink-0">
                {getIcon()}
            </div>
            <div className="flex-1 space-y-1 pr-8">
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
                <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                </div>
            </div>
            
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-11 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                onClick={handleDelete}
                title="Delete notification"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
