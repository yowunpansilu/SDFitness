import { useState, useEffect } from "react";
import { useMessageStore } from "@/lib/stores/messageStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export function NewChatModal() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { availableUsers, fetchAvailableUsers, startConversation, isSending } = useMessageStore();

    useEffect(() => {
        if (open) {
            fetchAvailableUsers();
        }
    }, [open, fetchAvailableUsers]);

    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectUser = async (userId: string) => {
        await startConversation(userId);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground">
                    <Plus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Chat</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search available users..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-4">No users found.</p>
                        ) : (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => !isSending && handleSelectUser(user.id)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted ${isSending ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <Avatar>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
