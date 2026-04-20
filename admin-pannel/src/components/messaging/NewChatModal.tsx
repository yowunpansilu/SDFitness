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
                <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 text-navy-400 border-navy-100 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 rounded-xl transition-all active:scale-95">
                    <Plus className="h-5 w-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-black text-navy-900 tracking-tight italic uppercase">Direct Message</DialogTitle>
                </DialogHeader>
                <div className="px-6 py-4">
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-navy-400" />
                        <Input
                            placeholder="Search members..."
                            className="pl-10 bg-navy-50/50 border-navy-100 text-navy-900 placeholder:text-navy-400 focus-visible:ring-indigo-500 rounded-xl"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-navy-50 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Search className="h-6 w-6 text-navy-200" />
                                </div>
                                <p className="text-sm font-bold text-navy-400">No members found</p>
                            </div>
                        ) : (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => !isSending && handleSelectUser(user.id)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all hover:bg-indigo-50 group ${isSending ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <Avatar>
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-black text-navy-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                                        <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest">{user.role}</p>
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
