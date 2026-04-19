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
        <div
            className={cn("flex w-full mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300", isOwn ? "justify-end" : "justify-start")}
        >
            <div
                className={cn(
                    "relative max-w-[80%] px-4 py-2.5 shadow-sm transition-all duration-200",
                    isOwn
                        ? "bg-indigo-600 text-white rounded-[20px] rounded-br-none"
                        : "bg-gray-100 text-gray-900 rounded-[20px] rounded-bl-none"
                )}
            >
                {message.type === 'text' && (
                    <p className="leading-normal text-[15px] font-medium">{message.content}</p>
                )}

                <div className={cn(
                    "flex items-center gap-1 text-[9px] mt-1 font-bold uppercase tracking-tighter opacity-60",
                    isOwn ? "justify-end text-indigo-100" : "justify-start text-gray-500"
                )}>
                    <span>{format(new Date(message.timestamp), "h:mm a")}</span>
                    {isOwn && (
                        <span className="ml-0.5">
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
