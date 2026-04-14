import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Search } from 'lucide-react';
import { AppAvatar } from '../../components/ui/AppAvatar';

export function MessagesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // Mock data for trainers
  const conversations = [
    { id: '1', name: 'Coach Marcus', avatar: 'https://i.pravatar.cc/150?u=marcus', lastMessage: 'Great form on those deadlifts today!', time: '10:42 AM', unread: 2, online: true },
    { id: '2', name: 'Sarah (Nutritionist)', avatar: 'https://i.pravatar.cc/150?u=sarah', lastMessage: 'Have you logged your macros for today?', time: 'Yesterday', unread: 0, online: false },
    { id: '3', name: 'SDFitness Support', avatar: '', lastMessage: 'Your payment was successful.', time: 'Sep 24', unread: 0, online: true },
  ];

  return (
    <div className="pb-32 page-animate-in bg-base min-h-screen flex flex-col">
      <header className="px-6 py-4 pt-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-ink hover:text-brand transition-colors p-2 -ml-2">
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-headline font-bold text-lg text-white">Communications</h2>
        <div className="w-10" />
      </header>

      <div className="px-6 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full h-12 bg-surface/20 border border-white/5 rounded-2xl pl-11 pr-4 text-white font-sans text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-2">
        {conversations.map(chat => (
          <div key={chat.id} className="flex items-center gap-4 p-4 bg-surface/10 hover:bg-surface/20 border border-transparent hover:border-white/5 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98]">
            <AppAvatar altText={chat.name} src={chat.avatar} size={56} status={chat.online ? 'online' : 'offline'} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-end mb-1">
                <h3 className="text-white font-bold text-base truncate">{chat.name}</h3>
                <span className="text-[10px] text-ink-muted font-bold tracking-widest uppercase flex-shrink-0 ml-2">{chat.time}</span>
              </div>
              <p className={`text-sm truncate w-[90%] ${chat.unread ? 'text-white font-medium' : 'text-ink-muted'}`}>
                {chat.lastMessage}
              </p>
            </div>
            {chat.unread > 0 && (
              <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shadow-brand">
                {chat.unread}
              </div>
            )}
          </div>
        ))}
        {conversations.length === 0 && (
          <div className="text-center py-10 opacity-50">
            <Send size={48} className="mx-auto mb-4 opacity-50 text-ink-muted" />
            <p className="text-white font-bold">No active conversations</p>
            <p className="text-ink-muted text-sm mt-1">Connect with a trainer to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
}
