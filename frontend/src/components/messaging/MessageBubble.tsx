import { type Message } from "@/lib/api/messageService";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface Props {
    message: Message;
    isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: Props) {
    return (
        <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "relative max-w-[70%] px-4 py-2 rounded-2xl text-sm",
                    isOwn
                        ? "bg-primary-500 text-black rounded-br-none"
                        : "bg-muted text-black rounded-bl-none"
                )}
            >
                {message.type === 'text' && (
                    <p className="leading-snug">{message.content}</p>
                )}

                <div className={cn(
                    "flex items-center gap-1 text-[10px] mt-1 opacity-70",
                    isOwn ? "justify-end text-foreground" : "justify-start text-muted-foreground"
                )}>
                    <span>{format(new Date(message.timestamp), "h:mm a")}</span>
                    {isOwn && (
                        <span>
                            {message.read ? (
                                <CheckCheck className="h-3 w-3" />
                            ) : (
                                <Check className="h-3 w-3" />
                            )}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
