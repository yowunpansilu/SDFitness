import { useMessageStore } from "@/lib/stores/messageStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { socketService } from "@/lib/api/messageService";

export function ChatWindow() {
    const { activeConversationId, conversations, messages, receiveMessage, selectConversation } = useMessageStore();
    const { user } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
    const participant = activeConversation?.participants[0];

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [activeMessages]);

    // Socket and Messages fetch
    useEffect(() => {
        if (activeConversationId) {
            selectConversation(activeConversationId);

            socketService.connect();
            socketService.joinRoom(activeConversationId);

            const handleMessage = (msg: any) => {
                receiveMessage(msg);
            };

            socketService.onMessage(handleMessage);

            return () => {
                socketService.leaveRoom(activeConversationId);
                socketService.offMessage(handleMessage);
            };
        }
    }, [activeConversationId, selectConversation, receiveMessage]);

    if (!activeConversation || !participant) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background h-full">
                <div className="text-center text-muted-foreground">
                    <p className="text-lg font-medium text-foreground italic uppercase">No conversation selected</p>
                    <p className="text-sm">Choose a chat to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background flex-1 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="border border-border">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-indigo-600 text-white font-bold">{participant.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-border bg-green-500" />
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-foreground">{participant.name}</h2>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                            Active Now
                        </p>
                    </div>
                </div>

                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                        <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-navy-50/10">
                <div className="space-y-4 max-w-3xl mx-auto flex flex-col">
                    {activeMessages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={String(msg.senderId) === String(user?.id) || String(msg.senderId) === String(user?._id)}
                        />
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Overlay */}
            <div className="p-4 bg-transparent">
                <MessageInput />
            </div>
        </div>
    );
}
