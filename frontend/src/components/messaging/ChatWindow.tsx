import { useMessageStore } from "@/lib/stores/messageStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";
import { Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { socketService } from "@/lib/api/messageService";

export function ChatWindow() {
    const { activeConversationId, conversations, messages, receiveMessage } = useMessageStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
    const participant = activeConversation?.participants[0];

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeMessages]);

    // Socket listener
    useEffect(() => {
        socketService.connect();
        socketService.onMessage(receiveMessage);
        return () => {
            socketService.offMessage(receiveMessage);
            socketService.disconnect();
        };
    }, [receiveMessage]);

    if (!activeConversation || !participant) {
        return (
            <div className="flex-1 flex items-center justify-center bg-dark-900 h-full">
                <div className="text-center text-gray-400">
                    <p className="text-lg font-medium text-white">No conversation selected</p>
                    <p className="text-sm">Choose a chat to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-dark-900 flex-1 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-800">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="border border-dark-600">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-dark-600 text-white">{participant.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-dark-800 bg-green-500" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-sm text-white">{participant.name}</h2>
                        <p className="text-xs text-gray-400 capitalize">{participant.status}</p>
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
                            key={msg.id}
                            message={msg}
                            isOwn={msg.senderId === 'user_123'}
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
