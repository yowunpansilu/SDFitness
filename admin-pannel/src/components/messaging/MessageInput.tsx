import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Paperclip, Send } from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMessageStore } from "@/lib/stores/messageStore";

export function MessageInput() {
    const [message, setMessage] = useState("");
    const { sendMessage, isSending } = useMessageStore();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = async () => {
        if (!message.trim() || isSending) return;
        await sendMessage(message);
        setMessage("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prev) => prev + emojiData.emoji);
    };

    return (
        <div className="p-4 bg-white/50 backdrop-blur-xl border-t border-navy-100">
            <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="shrink-0 text-navy-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                    <Paperclip className="h-5 w-5" />
                    <span className="sr-only">Attach file</span>
                </Button>

                <div className="flex-1 relative">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type something amazing..."
                        className="min-h-[44px] max-h-[120px] resize-none pr-10 py-3 bg-white border-navy-100 text-navy-900 placeholder:text-navy-400 focus-visible:ring-indigo-500 rounded-2xl shadow-inner-sm"
                        rows={1}
                    />

                    <div className="absolute right-2 bottom-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-navy-400 hover:text-indigo-600 hover:bg-transparent">
                                    <Smile className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="end" className="p-0 border-none w-auto shadow-2xl">
                                <EmojiPicker onEmojiClick={onEmojiClick} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    size="icon"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all active:scale-95 h-11 w-11"
                >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                </Button>
            </div>
        </div>
    );
}
