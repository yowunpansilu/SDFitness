import { useMessageStore } from "@/lib/stores/messageStore";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ChatWindow } from "@/components/messaging/ChatWindow";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function MessagesPage() {
    const { fetchConversations, activeConversationId } = useMessageStore();

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-navy-900 tracking-tight uppercase italic">
                        Messages
                    </h1>
                    <p className="text-sm font-bold text-navy-500 uppercase tracking-widest mt-1">
                        Member and Trainer Communications
                    </p>
                </div>
            </div>

            <div className="h-[calc(100vh-14rem)] bg-white border border-navy-100 rounded-3xl overflow-hidden shadow-xl shadow-navy-900/5 flex animate-fade-in relative">
                {/* List Sidebar */}
                <div className={cn(
                    "w-full md:w-[350px] border-r border-navy-100 flex-shrink-0 bg-navy-50/30 md:flex",
                    activeConversationId ? "hidden" : "flex"
                )}>
                    <div className="w-full h-full">
                        <ConversationList />
                    </div>
                </div>

                {/* Chat Window */}
                <div className={cn(
                    "flex-1 flex flex-col min-w-0 bg-white md:flex",
                    !activeConversationId ? "hidden" : "flex"
                )}>
                    <ChatWindow />
                </div>
            </div>
        </div>
    );
}
