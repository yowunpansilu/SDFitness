import api from '../lib/api/axios';

export interface Setting {
    key: string;
    value: unknown;
    category?: string;
    description?: string;
}

export const settingsService = {
    getAllSettings: async () => {
        const response = await api.get<Setting[]>('/settings');
        return response.data;
    },

    updateSetting: async (key: string, value: unknown, category?: string, description?: string) => {
        const response = await api.put<Setting>('/settings', {
            key,
            value,
            category,
            description
        });
        return response.data;
    }
};
