
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
    fileUrl?: string; // Mock URL for attachments
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage: Message;
    unreadCount: number;
}

const MOCK_TRAINERS: User[] = [
    {
        id: 'trainer_1',
        name: 'Sarah Connor',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        role: 'trainer',
        status: 'online'
    },
    {
        id: 'trainer_2',
        name: 'John Wick',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        role: 'trainer',
        status: 'busy'
    }
];

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv_1',
        participants: [MOCK_TRAINERS[0]],
        lastMessage: {
            id: 'msg_100',
            conversationId: 'conv_1',
            senderId: 'trainer_1',
            content: 'Great job on the HIIT session today!',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: true,
            type: 'text'
        },
        unreadCount: 0
    },
    {
        id: 'conv_2',
        participants: [MOCK_TRAINERS[1]],
        lastMessage: {
            id: 'msg_200',
            conversationId: 'conv_2',
            senderId: 'trainer_2',
            content: 'Don\'t forget to send your meal log.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            read: false,
            type: 'text'
        },
        unreadCount: 1
    }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
    'conv_1': [
        {
            id: 'msg_1',
            conversationId: 'conv_1',
            senderId: 'trainer_1',
            content: 'Hey! Ready for our session?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            read: true,
            type: 'text'
        },
        {
            id: 'msg_2',
            conversationId: 'conv_1',
            senderId: 'user_123',
            content: 'Yes! Just warming up.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23.9).toISOString(),
            read: true,
            type: 'text'
        },
        {
            id: 'msg_100',
            conversationId: 'conv_1',
            senderId: 'trainer_1',
            content: 'Great job on the HIIT session today!',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            read: true,
            type: 'text'
        }
    ],
    'conv_2': [
        {
            id: 'msg_200',
            conversationId: 'conv_2',
            senderId: 'trainer_2',
            content: 'Don\'t forget to send your meal log.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            read: false,
            type: 'text'
        }
    ]
};

// Simulated API calls
export const getConversations = async (): Promise<Conversation[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_CONVERSATIONS), 500));
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_MESSAGES[conversationId] || []), 500));
};

export const sendMessageAPI = async (conversationId: string, content: string, type: 'text' | 'image' = 'text'): Promise<Message> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newMessage: Message = {
                id: `msg_${Date.now()}`,
                conversationId,
                senderId: 'user_123', // Current user
                content,
                timestamp: new Date().toISOString(),
                read: true,
                type
            };
            resolve(newMessage);
        }, 300);
    });
};

// Mock Socket Service
type MessageHandler = (message: Message) => void;

class MockSocketService {
    private handlers: MessageHandler[] = [];

    connect() {
        console.log('Mock Socket Connected');
    }

    disconnect() {
        console.log('Mock Socket Disconnected');
    }

    onMessage(handler: MessageHandler) {
        this.handlers.push(handler);
    }

    offMessage(handler: MessageHandler) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    // Simulate receiving a message from a trainer
    simulateIncomingMessage(conversationId: string) {
        setTimeout(() => {
            const incomingMsg: Message = {
                id: `msg_inc_${Date.now()}`,
                conversationId,
                senderId: conversationId === 'conv_1' ? 'trainer_1' : 'trainer_2',
                content: 'This is a real-time update!',
                timestamp: new Date().toISOString(),
                read: false,
                type: 'text'
            };
            this.handlers.forEach(h => h(incomingMsg));
        }, 3000); // 3 seconds delay
    }
}

export const socketService = new MockSocketService();
