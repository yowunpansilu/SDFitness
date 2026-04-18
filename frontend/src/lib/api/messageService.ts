import api from './axios';

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
    lastMessage: Message;
    unreadCount: number;
}

// Service calls
export const getConversations = async (): Promise<Conversation[]> => {
    try {
        const response = await api.get('/communication/conversations');
        // Map backend conversations to frontend interface
        return (response.data || []).map((conv: any) => ({
            id: conv._id,
            participants: conv.participants.map((p: any) => ({
                id: p._id,
                name: `${p.firstName} ${p.lastName}`.trim(),
                avatar: p.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p._id}`,
                role: p.role,
                status: 'online'
            })),
            lastMessage: conv.lastMessage ? {
                id: conv.lastMessage._id,
                conversationId: conv._id,
                senderId: conv.lastMessage.sender,
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
        return (response.data || []).map((msg: any) => ({
            id: msg._id,
            conversationId: msg.conversation,
            senderId: msg.sender,
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
            senderId: msg.sender,
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

// Placeholder Socket Service (Real implementation would use Socket.io)
type MessageHandler = (message: Message) => void;

class SocketService {
    private handlers: MessageHandler[] = [];

    connect() {
        console.log('Real-time Socket Service Placeholder Connected');
    }

    disconnect() {
        console.log('Real-time Socket Service Placeholder Disconnected');
    }

    onMessage(handler: MessageHandler) {
        this.handlers.push(handler);
    }

    offMessage(handler: MessageHandler) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    // No simulation in production-ready code
}

export const socketService = new SocketService();
