import { useMessageStore } from "@/lib/stores/messageStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { NewChatModal } from "./NewChatModal";
import { useAuthStore } from "@/lib/stores/authStore";

export function ConversationList() {
    const { conversations, activeConversationId, selectConversation, isLoading } = useMessageStore();
    const { user: currentUser } = useAuthStore();
    const [search, setSearch] = useState("");

    const filteredConversations = conversations.filter(c => {
        const other = c.participants.find(p => p.id !== (currentUser?.id || currentUser?._id));
        return other?.name.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full border-r border-navy-100 bg-navy-50/20 backdrop-blur-xl">
            <div className="p-4 border-b border-border flex gap-2 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-8 bg-white/50 border-navy-100 text-navy-900 placeholder:text-navy-400 focus-visible:ring-indigo-500 rounded-xl"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <NewChatModal />
            </div>

            <div className="flex-1 overflow-y-auto px-1 pt-2 custom-scrollbar">
                {isLoading && conversations.length === 0 ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 mx-2">
                            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12 px-6">
                        <p className="text-sm font-bold text-navy-400 italic">No conversations found</p>
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const participant = conv.participants.find(p => p.id !== (currentUser?.id || currentUser?._id)) || conv.participants[0];
                        const isActive = conv.id === activeConversationId;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => selectConversation(conv.id)}
                                className={cn(
                                    "flex items-center gap-4 p-4 cursor-pointer transition-all duration-300 hover:bg-white/60 mx-2 my-1 rounded-2xl group",
                                    isActive && "bg-white shadow-lg shadow-navy-100/50 scale-[1.02]"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-600 rounded-full" />
                                )}

                                <div className="relative">
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarImage src={participant.avatar} />
                                        <AvatarFallback className="bg-accent text-foreground">{participant.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className={cn(
                                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
                                        participant.status === 'online' ? "bg-green-500" :
                                            participant.status === 'busy' ? "bg-red-500" : "bg-gray-400"
                                    )} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <span className="font-bold text-navy-900 group-hover:text-indigo-600 transition-colors truncate">
                                            {participant.name}
                                        </span>
                                        {conv.lastMessage && (
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: false })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={cn(
                                            "text-xs truncate max-w-[140px]",
                                            conv.unreadCount > 0 ? "text-navy-900 font-bold" : "text-navy-500"
                                        )}>
                                            {conv.lastMessage?.content || "Start a conversation"}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-indigo-600 text-[10px] font-black text-white shadow-lg shadow-indigo-600/20">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
