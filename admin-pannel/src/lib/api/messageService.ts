import api from './axios';

interface ApiUser {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: 'member' | 'trainer';
}

interface ApiMessage {
    _id: string;
    conversation: string;
    sender: string | { _id: string };
    text: string;
    createdAt: string;
    isRead: boolean;
}

interface ApiConversation {
    _id: string;
    participants: ApiUser[];
    lastMessage?: ApiMessage;
}

export interface User {
    id: string;
    name: string;
    avatar: string;
    role: 'member' | 'trainer';
    status: 'online' | 'offline' | 'busy';
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
    type: 'text' | 'image' | 'file';
    fileUrl?: string;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage: Message | null;
    unreadCount: number;
}

export const getAvailableUsers = async (): Promise<User[]> => {
    try {
        const response = await api.get('/communication/available-users');
        return (response.data || []).map((u: ApiUser) => ({
            id: u._id,
            name: `${u.firstName} ${u.lastName}`.trim(),
            avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`,
            role: u.role,
            status: 'online'
        }));
    } catch (error) {
        console.error('Failed to fetch available users:', error);
        return [];
    }
};

export const createConversationAPI = async (targetUserId: string): Promise<Conversation> => {
    try {
        const response = await api.post('/communication/conversations', { targetUserId });
        const conv = response.data;
        return {
            id: conv._id,
            participants: conv.participants.map((p: ApiUser) => ({
                id: p._id,
                name: `${p.firstName} ${p.lastName}`.trim(),
                avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p._id}`,
                role: p.role,
                status: 'online'
            })),
            lastMessage: conv.lastMessage ? {
                id: conv.lastMessage._id,
                conversationId: conv._id,
                senderId: typeof conv.lastMessage.sender === 'string' ? conv.lastMessage.sender : (conv.lastMessage.sender as { _id: string })._id,
                content: conv.lastMessage.text,
                timestamp: conv.lastMessage.createdAt,
                read: conv.lastMessage.isRead,
                type: 'text'
            } : null,
            unreadCount: 0
        };
    } catch (error) {
        console.error('Failed to create conversation:', error);
        throw error;
    }
};

// Service calls
export const getConversations = async (): Promise<Conversation[]> => {
    try {
        const response = await api.get('/communication/conversations');
        // Map backend conversations to frontend interface
        return (response.data || []).map((conv: ApiConversation) => ({
            id: conv._id,
            participants: conv.participants.map((p: ApiUser) => ({
                id: p._id,
                name: `${p.firstName} ${p.lastName}`.trim(),
                avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p._id}`,
                role: p.role,
                status: 'online'
            })),
            lastMessage: conv.lastMessage ? {
                id: conv.lastMessage._id,
                conversationId: conv._id,
                senderId: typeof conv.lastMessage.sender === 'string' ? conv.lastMessage.sender : (conv.lastMessage.sender as { _id: string })._id,
                content: conv.lastMessage.text,
                timestamp: conv.lastMessage.createdAt,
                read: conv.lastMessage.isRead,
                type: 'text'
            } : null,
            unreadCount: 0 // Backend doesn't provide unread count per conv yet
        }));
    } catch (error) {
        console.error('Failed to fetch conversations:', error);
        return [];
    }
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
    try {
        const response = await api.get('/communication/messages', { params: { conversationId } });
        return (response.data || []).map((msg: ApiMessage) => ({
            id: msg._id,
            conversationId: msg.conversation,
            senderId: typeof msg.sender === 'string' ? msg.sender : (msg.sender as { _id: string })._id,
            content: msg.text,
            timestamp: msg.createdAt,
            read: msg.isRead,
            type: 'text'
        }));
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        return [];
    }
};

export const sendMessageAPI = async (conversationId: string, content: string, type: 'text' | 'image' = 'text'): Promise<Message> => {
    try {
        const response = await api.post('/communication/messages', { conversationId, text: content });
        const msg = response.data;
        return {
            id: msg._id,
            conversationId: msg.conversation,
            senderId: typeof msg.sender === 'string' ? msg.sender : (msg.sender as { _id: string })._id,
            content: msg.text,
            timestamp: msg.createdAt,
            read: msg.isRead,
            type
        };
    } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
    }
};

import { io, Socket } from 'socket.io-client';

// ... (omitting other parts for brevity, same as frontend)

// Real Socket Service
type MessageHandler = (message: Message) => void;

class SocketService {
    private socket: Socket | null = null;
    private handlers: MessageHandler[] = [];

    connect() {
        if (this.socket) return;

        const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5005';
        this.socket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to real-time messaging server');
        });

        this.socket.on('new_message', (message: Message) => {
            console.log('📬 New real-time message received:', message);
            this.handlers.forEach(handler => handler(message));
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from real-time messaging server');
        });
    }

    joinRoom(conversationId: string) {
        if (this.socket) {
            this.socket.emit('join_room', conversationId);
        }
    }

    leaveRoom(conversationId: string) {
        if (this.socket) {
            this.socket.emit('leave_room', conversationId);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onMessage(handler: MessageHandler) {
        this.handlers.push(handler);
    }

    offMessage(handler: MessageHandler) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    simulateIncomingMessage(conversationId: string) {
        // No simulation in production-ready code
        console.log(`Simulation skipped for ${conversationId}`);
    }
}

export const socketService = new SocketService();
