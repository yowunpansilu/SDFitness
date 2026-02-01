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
        <div className="h-[calc(100vh-8rem)] bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden shadow-xl flex animate-fade-in">
            {/* List Sidebar - Hidden on mobile when chat is active */}
            <div className={cn(
                "w-full md:w-80 border-r border-dark-700 flex-shrink-0 bg-dark-800 md:flex",
                activeConversationId ? "hidden" : "flex"
            )}>
                <div className="w-full h-full">
                    <ConversationList />
                </div>
            </div>

            {/* Chat Window - Hidden on mobile when no chat is selected */}
            <div className={cn(
                "flex-1 flex flex-col min-w-0 bg-dark-900 md:flex",
                !activeConversationId ? "hidden" : "flex"
            )}>
                <ChatWindow />
            </div>
        </div>
    );
}
