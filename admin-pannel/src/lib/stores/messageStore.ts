import { create } from 'zustand';
import {
    type Message,
    type Conversation,
    type User,
    getConversations,
    getMessages,
    sendMessageAPI,
    getAvailableUsers,
    createConversationAPI,
    socketService
} from '@/lib/api/messageService';
import { produce } from 'immer';

interface MessageState {
    conversations: Conversation[];
    activeConversationId: string | null;
    messages: Record<string, Message[]>; // Map conversationId to messages
    availableUsers: User[];
    isLoading: boolean;
    isSending: boolean;

    // Actions
    fetchConversations: () => Promise<void>;
    fetchAvailableUsers: () => Promise<void>;
    selectConversation: (id: string) => Promise<void>;
    startConversation: (userId: string) => Promise<void>;
    sendMessage: (content: string, type?: 'text' | 'image') => Promise<void>;
    receiveMessage: (message: Message) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    messages: {},
    availableUsers: [],
    isLoading: false,
    isSending: false,

    fetchConversations: async () => {
        set({ isLoading: true });
        try {
            const conversations = await getConversations();
            set({ conversations, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
        }
    },

    fetchAvailableUsers: async () => {
        try {
            const users = await getAvailableUsers();
            set({ availableUsers: users });
        } catch (error) {
            console.error('Failed to fetch available users', error);
        }
    },

    startConversation: async (userId: string) => {
        set({ isSending: true });
        try {
            const newConv = await createConversationAPI(userId);
            set(produce((state: MessageState) => {
                if (!state.conversations.find(c => c.id === newConv.id)) {
                    state.conversations.unshift(newConv);
                }
                state.activeConversationId = newConv.id;
            }));
            await get().selectConversation(newConv.id);
        } catch (error) {
            console.error('Failed to start conversation', error);
        } finally {
            set({ isSending: false });
        }
    },

    selectConversation: async (id: string) => {
        set({ activeConversationId: id });

        // Return if messages already loaded (optional optimization, disabling for now to ensure freshness)
        // if (get().messages[id]) return;

        try {
            const msgs = await getMessages(id);
            set(produce((state: MessageState) => {
                state.messages[id] = msgs;

                // Mark conversation as read in local state
                const conv = state.conversations.find(c => c.id === id);
                if (conv) conv.unreadCount = 0;
            }));
        } catch (error) {
            console.error(error);
        }
    },

    sendMessage: async (content: string, type = 'text') => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        set({ isSending: true });
        try {
            const newMessage = await sendMessageAPI(activeConversationId, content, type);

            set(produce((state: MessageState) => {
                // Add to messages list
                if (!state.messages[activeConversationId]) {
                    state.messages[activeConversationId] = [];
                }
                state.messages[activeConversationId].push(newMessage);

                // Update last message in conversation list
                const conv = state.conversations.find(c => c.id === activeConversationId);
                if (conv) {
                    conv.lastMessage = newMessage;
                }
            }));

            // Simulate a reply for demo purposes
            socketService.simulateIncomingMessage(activeConversationId);

        } catch (error) {
            console.error(error);
        } finally {
            set({ isSending: false });
        }
    },

    receiveMessage: (message: Message) => {
        set(produce((state: MessageState) => {
            const { conversationId } = message;

            // Add to messages if conversation is loaded
            if (state.messages[conversationId]) {
                state.messages[conversationId].push(message);
            }

            // Update conversation list
            const conv = state.conversations.find(c => c.id === conversationId);
            if (conv) {
                conv.lastMessage = message;
                // Increment unread if not currently active
                if (state.activeConversationId !== conversationId) {
                    conv.unreadCount += 1;
                }
            }
        }));
    }
}));
