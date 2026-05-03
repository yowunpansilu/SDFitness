import { create } from 'zustand';
import { settingsService } from '../../services/settingsService';

export interface GeneralSettings {
    gymName: string;
    logoUrl: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    website: string;
    socialMedia: {
        facebook: string;
        instagram: string;
        twitter: string;
    };
    businessHours: {
        [key: string]: {
            isOpen: boolean;
            openTime: string;
            closeTime: string;
        };
    };
    currency: string;
    timezone: string;
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
}

export interface NotificationSettings {
    types: {
        [key: string]: {
            enabled: boolean;
            channels: {
                email: boolean;
                sms: boolean;
                push: boolean;
            };
        };
    };
    smtp: {
        host: string;
        port: number;
        username: string;
        password: string;
        useSsl: boolean;
    };
    sms: {
        provider: string;
        apiKey: string;
        senderId: string;
    };
    push: {
        firebaseServerKey: string;
        oneSignalAppId: string;
    };
}

export interface Role {
    id: string;
    name: string;
    description: string;
    isCustom: boolean;
    userCount: number;
    permissions: {
        [resource: string]: {
            view: boolean;
            create: boolean;
            edit: boolean;
            delete: boolean;
        };
    };
}

interface SettingsState {
    // Settings data
    generalSettings: GeneralSettings;
    emailTemplates: EmailTemplate[];
    notificationSettings: NotificationSettings;
    roles: Role[];

    // UI state
    hasUnsavedChanges: boolean;
    isLoading: boolean;

    // Actions
    updateGeneralSettings: (settings: Partial<GeneralSettings>) => void;
    updateEmailTemplate: (templateId: string, updates: Partial<EmailTemplate>) => void;
    updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
    updateRole: (roleId: string, updates: Partial<Role>) => void;
    addRole: (role: Role) => void;
    deleteRole: (roleId: string) => void;
    fetchSettings: () => Promise<void>;
    saveSettings: () => Promise<void>;
    resetSettings: () => void;
    setUnsavedChanges: (value: boolean) => void;
}

// Mock initial data
const initialGeneralSettings: GeneralSettings = {
    gymName: 'SD Fitness',
    logoUrl: '',
    email: 'info@sdfitness.com',
    phone: '+1 (555) 123-4567',
    address: {
        street: '123 Fitness Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
    },
    website: 'https://sdfitness.com',
    socialMedia: {
        facebook: 'https://facebook.com/sdfitness',
        instagram: 'https://instagram.com/sdfitness',
        twitter: 'https://twitter.com/sdfitness',
    },
    businessHours: {
        monday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        tuesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        wednesday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        thursday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        friday: { isOpen: true, openTime: '06:00', closeTime: '22:00' },
        saturday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
        sunday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
    },
    currency: 'LKR',
    timezone: 'Asia/Colombo',
};

const initialEmailTemplates: EmailTemplate[] = [
    {
        id: '1',
        name: 'Welcome Email',
        subject: 'Welcome to {{gymName}}!',
        body: 'Hi {{memberName}},\n\nWelcome to {{gymName}}! We\'re excited to have you as a member.\n\nBest regards,\nThe {{gymName}} Team',
        variables: ['gymName', 'memberName'],
    },
    {
        id: '2',
        name: 'Payment Confirmation',
        subject: 'Payment Received - {{amount}}',
        body: 'Hi {{memberName}},\n\nWe have received your payment of {{amount}} for {{description}}.\n\nThank you!\n{{gymName}}',
        variables: ['memberName', 'amount', 'description', 'gymName'],
    },
    {
        id: '3',
        name: 'Class Reminder',
        subject: 'Reminder: {{className}} at {{time}}',
        body: 'Hi {{memberName}},\n\nThis is a reminder that you have {{className}} scheduled for {{date}} at {{time}}.\n\nSee you there!\n{{gymName}}',
        variables: ['memberName', 'className', 'date', 'time', 'gymName'],
    },
    {
        id: '4',
        name: 'Membership Expiry Warning',
        subject: 'Your membership expires in {{daysRemaining}} days',
        body: 'Hi {{memberName}},\n\nYour membership at {{gymName}} will expire on {{expiryDate}}.\n\nPlease renew to continue enjoying our services.\n\nBest regards,\n{{gymName}}',
        variables: ['memberName', 'gymName', 'expiryDate', 'daysRemaining'],
    },
];

const initialNotificationSettings: NotificationSettings = {
    types: {
        newMemberRegistration: {
            enabled: true,
            channels: { email: true, sms: false, push: true },
        },
        paymentReceived: {
            enabled: true,
            channels: { email: true, sms: true, push: false },
        },
        paymentFailed: {
            enabled: true,
            channels: { email: true, sms: true, push: true },
        },
        classBooking: {
            enabled: true,
            channels: { email: true, sms: false, push: true },
        },
        classCancellation: {
            enabled: true,
            channels: { email: true, sms: true, push: true },
        },
        membershipExpiry: {
            enabled: true,
            channels: { email: true, sms: true, push: true },
        },
        equipmentMaintenance: {
            enabled: true,
            channels: { email: true, sms: false, push: false },
        },
    },
    smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        username: '',
        password: '',
        useSsl: true,
    },
    sms: {
        provider: 'twilio',
        apiKey: '',
        senderId: '',
    },
    push: {
        firebaseServerKey: '',
        oneSignalAppId: '',
    },
};

const initialRoles: Role[] = [
    {
        id: '1',
        name: 'Admin',
        description: 'Full system access',
        isCustom: false,
        userCount: 2,
        permissions: {
            members: { view: true, create: true, edit: true, delete: true },
            trainers: { view: true, create: true, edit: true, delete: true },
            classes: { view: true, create: true, edit: true, delete: true },
            payments: { view: true, create: true, edit: true, delete: true },
            equipment: { view: true, create: true, edit: true, delete: true },
            plans: { view: true, create: true, edit: true, delete: true },
            reports: { view: true, create: true, edit: true, delete: true },
            settings: { view: true, create: true, edit: true, delete: true },
        },
    },
    {
        id: '2',
        name: 'Manager',
        description: 'Manage operations, no settings access',
        isCustom: false,
        userCount: 3,
        permissions: {
            members: { view: true, create: true, edit: true, delete: true },
            trainers: { view: true, create: true, edit: true, delete: false },
            classes: { view: true, create: true, edit: true, delete: true },
            payments: { view: true, create: true, edit: true, delete: false },
            equipment: { view: true, create: true, edit: true, delete: false },
            plans: { view: true, create: true, edit: true, delete: false },
            reports: { view: true, create: true, edit: false, delete: false },
            settings: { view: false, create: false, edit: false, delete: false },
        },
    },
    {
        id: '3',
        name: 'Receptionist',
        description: 'Front desk operations',
        isCustom: false,
        userCount: 5,
        permissions: {
            members: { view: true, create: true, edit: true, delete: false },
            trainers: { view: true, create: false, edit: false, delete: false },
            classes: { view: true, create: true, edit: true, delete: false },
            payments: { view: true, create: true, edit: false, delete: false },
            equipment: { view: true, create: false, edit: false, delete: false },
            plans: { view: true, create: false, edit: false, delete: false },
            reports: { view: true, create: false, edit: false, delete: false },
            settings: { view: false, create: false, edit: false, delete: false },
        },
    },
    {
        id: '4',
        name: 'Trainer',
        description: 'View classes and assigned members',
        isCustom: false,
        userCount: 8,
        permissions: {
            members: { view: true, create: false, edit: false, delete: false },
            trainers: { view: true, create: false, edit: false, delete: false },
            classes: { view: true, create: false, edit: false, delete: false },
            payments: { view: false, create: false, edit: false, delete: false },
            equipment: { view: true, create: false, edit: false, delete: false },
            plans: { view: false, create: false, edit: false, delete: false },
            reports: { view: false, create: false, edit: false, delete: false },
            settings: { view: false, create: false, edit: false, delete: false },
        },
    },
];

export const useSettingsStore = create<SettingsState>()((set, get) => ({
    // Initial state
    generalSettings: initialGeneralSettings,
    emailTemplates: initialEmailTemplates,
    notificationSettings: initialNotificationSettings,
    roles: initialRoles,
    hasUnsavedChanges: false,
    isLoading: false,

    // Actions
    updateGeneralSettings: (settings) => {
        set({
            generalSettings: { ...get().generalSettings, ...settings },
            hasUnsavedChanges: true,
        });
    },

    updateEmailTemplate: (templateId, updates) => {
        set({
            emailTemplates: get().emailTemplates.map((template) =>
                template.id === templateId ? { ...template, ...updates } : template
            ),
            hasUnsavedChanges: true,
        });
    },

    updateNotificationSettings: (settings) => {
        set({
            notificationSettings: { ...get().notificationSettings, ...settings },
            hasUnsavedChanges: true,
        });
    },

    updateRole: (roleId, updates) => {
        set({
            roles: get().roles.map((role) =>
                role.id === roleId ? { ...role, ...updates } : role
            ),
            hasUnsavedChanges: true,
        });
    },

    addRole: (role) => {
        set({
            roles: [...get().roles, role],
            hasUnsavedChanges: true,
        });
    },

    deleteRole: (roleId) => {
        set({
            roles: get().roles.filter((role) => role.id !== roleId),
            hasUnsavedChanges: true,
        });
    },

    fetchSettings: async () => {
        set({ isLoading: true });
        try {
            const settings = await settingsService.getAllSettings();
            const updates: Partial<SettingsState> = {};

            settings.forEach(s => {
                if (s.key === 'generalSettings') updates.generalSettings = s.value as GeneralSettings;
                if (s.key === 'emailTemplates') updates.emailTemplates = s.value as EmailTemplate[];
                if (s.key === 'notificationSettings') updates.notificationSettings = s.value as NotificationSettings;
                if (s.key === 'roles') updates.roles = s.value as Role[];
            });

            if (Object.keys(updates).length > 0) {
                set(updates);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    saveSettings: async () => {
        set({ isLoading: true });

        try {
            const { generalSettings, emailTemplates, notificationSettings, roles } = get();

            await Promise.all([
                settingsService.updateSetting('generalSettings', generalSettings, 'general'),
                settingsService.updateSetting('emailTemplates', emailTemplates, 'email'),
                settingsService.updateSetting('notificationSettings', notificationSettings, 'notifications'),
                settingsService.updateSetting('roles', roles, 'security')
            ]);

            set({
                isLoading: false,
                hasUnsavedChanges: false,
            });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    resetSettings: () => {
        set({
            generalSettings: initialGeneralSettings,
            emailTemplates: initialEmailTemplates,
            notificationSettings: initialNotificationSettings,
            roles: initialRoles,
            hasUnsavedChanges: false,
        });
    },

    setUnsavedChanges: (value) => {
        set({ hasUnsavedChanges: value });
    },
}));
