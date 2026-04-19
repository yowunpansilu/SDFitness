import { useMessageStore } from "@/lib/stores/messageStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { NewChatModal } from "./NewChatModal";

export function ConversationList() {
    const { conversations, activeConversationId, selectConversation } = useMessageStore();
    const [search, setSearch] = useState("");

    const filteredConversations = conversations.filter(c =>
        c.participants[0].name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full border-r border-border bg-card">
            <div className="p-4 border-b border-border flex gap-2 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-8 bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <NewChatModal />
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => {
                    const participant = conv.participants[0];
                    const isActive = conv.id === activeConversationId;

                    return (
                        <div
                            key={conv.id}
                            onClick={() => selectConversation(conv.id)}
                            className={cn(
                                "flex items-center gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50",
                                isActive && "bg-muted/80 relative"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
                            )}

                            <div className="relative">
                                <Avatar className="h-10 w-10 border border-border">
                                    <AvatarImage src={participant.avatar} />
                                    <AvatarFallback className="bg-accent text-foreground">{participant.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className={cn(
                                    "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-border",
                                    participant.status === 'online' ? "bg-green-500" :
                                        participant.status === 'busy' ? "bg-red-500" : "bg-gray-400"
                                )} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-medium text-foreground truncate">{participant.name}</span>
                                    {conv.lastMessage && (
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(conv.lastMessage.timestamp), { addSuffix: false })}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={cn(
                                        "text-xs truncate max-w-[140px]",
                                        conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                    )}>
                                        {conv.lastMessage?.content || "Start a conversation"}
                                    </p>
                                    {conv.unreadCount > 0 && (
                                        <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-primary-500 text-[10px] font-medium text-foreground">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
