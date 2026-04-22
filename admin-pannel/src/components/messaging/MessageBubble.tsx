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
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={cn("flex w-full mb-3", isOwn ? "justify-end" : "justify-start")}
        >
            <div
                className={cn(
                    "relative max-w-[85%] px-5 py-3 shadow-xl shadow-navy-900/5 transition-all duration-300",
                    isOwn
                        ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[24px] rounded-br-[4px]"
                        : "bg-navy-50/50 backdrop-blur-sm border border-navy-100 text-navy-900 rounded-[24px] rounded-bl-[4px]"
                )}
            >
                {message.type === 'text' && (
                    <p className="leading-relaxed text-[15px] font-semibold tracking-tight">{message.content}</p>
                )}

                <div className={cn(
                    "flex items-center gap-1.5 text-[10px] mt-1.5 font-black uppercase tracking-widest opacity-70",
                    isOwn ? "justify-end text-indigo-100" : "justify-start text-navy-400"
                )}>
                    <span>{format(new Date(message.timestamp), "HH:mm")}</span>
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
