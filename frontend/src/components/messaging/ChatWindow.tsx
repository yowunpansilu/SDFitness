import { useMessageStore } from "@/lib/stores/messageStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";
import { Phone, Video, MoreVertical, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api/axios";

export function ChatWindow() {
    const { activeConversationId, conversations, messages } = useMessageStore();
    const { user } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [activeConversation, setActiveConversation] = useState<any>(null);

    useEffect(() => {
        const existing = conversations.find(c => c.otherUserId === activeConversationId);
        if (existing) {
            setActiveConversation(existing);
        } else if (activeConversationId) {
            // Fetch user info for the new chat
            api.get(`/auth/users`).then(res => {
                const user = res.data.users.find((u: any) => u._id === activeConversationId);
                if (user) {
                    setActiveConversation({
                        otherUserId: activeConversationId,
                        otherUser: user,
                        lastMessage: null,
                        unreadCount: 0
                    });
                }
            });
        }
    }, [activeConversationId, conversations]);

    const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
    const participant = activeConversation?.otherUser;

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeMessages]);

    if (!activeConversationId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-dark-900 h-full">
                <div className="text-center text-gray-400 p-8">
                    <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-10 w-10 text-dark-600" />
                    </div>
                    <p className="text-lg font-medium text-white">No conversation selected</p>
                    <p className="text-sm">Choose a chat or start a new one to begin messaging</p>
                </div>
            </div>
        );
    }

    if (!participant) return null; // Loading state

    return (
        <div className="flex flex-col h-full bg-dark-900 flex-1 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="border border-dark-600">
                            <AvatarImage src={participant.profilePhoto} />
                            <AvatarFallback className="bg-dark-600 text-white">
                                {participant.firstName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-dark-800 bg-green-500" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm text-white">
                            {participant.firstName} {participant.lastName}
                        </h2>
                        <p className="text-xs text-gray-400">Online</p>
                    </div>
                </div>

                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-dark-700">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-dark-700">
                        <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-dark-700">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                    {activeMessages.map((msg) => (
                        <MessageBubble
                            key={msg._id}
                            message={msg}
                            isOwn={String(msg.sender) === String(user?.id)}
                        />
                    ))}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <MessageInput />
        </div>
    );
}
