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
        <div className="p-4 border-t border-dark-700 bg-dark-800">
            <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="shrink-0 text-gray-400 hover:text-white hover:bg-dark-700">
                    <Paperclip className="h-5 w-5" />
                    <span className="sr-only">Attach file</span>
                </Button>

                <div className="flex-1 relative">
                    <Textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="min-h-[44px] max-h-[120px] resize-none pr-10 py-3 bg-dark-900 border-dark-600 text-white placeholder:text-gray-400 focus-visible:ring-primary-500"
                        rows={1}
                    />

                    <div className="absolute right-2 bottom-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white hover:bg-transparent">
                                    <Smile className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="end" className="p-0 border-none w-auto">
                                <EmojiPicker onEmojiClick={onEmojiClick} />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <Button
                    onClick={handleSend}
                    disabled={!message.trim() || isSending}
                    size="icon"
                    className="bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50"
                >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                </Button>
            </div>
        </div>
    );
}
