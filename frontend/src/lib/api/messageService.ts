import api from './axios';

// Types
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
}

export interface Message {
    _id: string;
    conversation: string;
    sender: User | string;
    text: string;
    isRead: boolean;
    createdAt: string;
}

export interface Conversation {
    _id: string;
    participants: User[];
    lastMessage?: Message;
    updatedAt: string;
    createdAt: string;
}

// Real API calls
export const getConversations = async (userId?: string): Promise<Conversation[]> => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await api.get(`/communications/conversations${params}`);
    return response.data;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
    const response = await api.get(`/communications/messages?conversationId=${conversationId}`);
    return response.data;
};

export const sendMessage = async (conversationId: string, senderId: string, text: string): Promise<Message> => {
    const response = await api.post('/communications/messages', {
        conversationId,
        senderId,
        text
    });
    return response.data;
};

// Simple event-based service (replaces mock socket)
class MessageEventService {
    private listeners: Map<string, Function[]> = new Map();

    connect() {
        console.log('Message service connected');
    }

    disconnect() {
        console.log('Message service disconnected');
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) this.listeners.set(event, []);
        this.listeners.get(event)!.push(callback);
    }

    off(event: string) {
        this.listeners.delete(event);
    }

    emit(event: string, data: any) {
        this.listeners.get(event)?.forEach(cb => cb(data));
    }

    simulateIncomingMessage(conversationId: string) {
        console.log(`Simulated incoming message for ${conversationId}`);
    }
}

export const socketService = new MessageEventService();
