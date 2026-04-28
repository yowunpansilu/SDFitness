import { useMessageStore } from "@/lib/stores/messageStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef, useMemo } from "react";
import { Phone, Video, MoreVertical, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { socketService } from "@/lib/api/messageService";
import { Skeleton } from "@/components/ui/skeleton";

export function ChatWindow() {
    const { activeConversationId, conversations, messages, receiveMessage, selectConversation, isLoading } = useMessageStore();
    const { user } = useAuthStore();
    const scrollRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const activeMessages = useMemo(() => activeConversationId ? messages[activeConversationId] || [] : [], [activeConversationId, messages]);
    const participant = activeConversation?.participants.find(p => p.id !== (user?.id || user?._id)) || activeConversation?.participants[0];

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

            const handleMessage = (msg: import("@/lib/api/messageService").Message) => {
                receiveMessage(msg);
            };

            socketService.onMessage(handleMessage);

            return () => {
                socketService.leaveRoom(activeConversationId);
                socketService.offMessage(handleMessage);
            };
        }
    }, [activeConversationId, selectConversation, receiveMessage]);

    if (isLoading && !activeConversation) {
        return (
            <div className="flex-1 flex flex-col h-full bg-white">
                <div className="flex items-center justify-between p-4 border-b border-navy-100">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-11 w-11 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                </div>
                <div className="flex-1 p-6 space-y-6">
                    <div className="flex justify-start"><Skeleton className="h-12 w-[60%] rounded-2xl" /></div>
                    <div className="flex justify-end"><Skeleton className="h-12 w-[40%] rounded-2xl" /></div>
                    <div className="flex justify-start"><Skeleton className="h-12 w-[50%] rounded-2xl" /></div>
                </div>
            </div>
        );
    }

    if (!activeConversation || !participant) {
        return (
            <div className="flex-1 flex items-center justify-center bg-white h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)] pointer-events-none" />
                <div className="text-center relative z-10 px-6">
                    <div className="bg-indigo-50 h-24 w-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 rotate-12 shadow-xl shadow-indigo-600/5">
                        <MessageSquare className="h-10 w-10 text-indigo-600 -rotate-12" />
                    </div>
                    <h2 className="text-2xl font-black text-navy-900 tracking-tight uppercase italic mb-2">Manage Discussion</h2>
                    <p className="text-navy-400 font-bold text-sm max-w-[280px] mx-auto leading-relaxed">
                        Select a member conversation from the sidebar to provide support or training feedback.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white flex-1 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-navy-100 bg-white/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-11 w-11 border-2 border-white ring-2 ring-navy-50 shadow-sm">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black">{participant.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 shadow-sm" />
                    </div>
                    <div>
                        <h2 className="font-black text-navy-900 leading-tight">{participant.name}</h2>
                        <p className="text-[10px] text-green-600 font-black uppercase tracking-[0.15em] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-navy-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Phone className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-navy-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-navy-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
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
