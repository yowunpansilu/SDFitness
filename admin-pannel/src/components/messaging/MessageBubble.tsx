import { type Message } from "@/lib/api/messageService";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    message: Message;
    isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn("flex w-full mb-2", isOwn ? "justify-end" : "justify-start")}
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
        </motion.div>
    );
}
