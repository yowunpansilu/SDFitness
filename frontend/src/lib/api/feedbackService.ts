import api from './axios';

export interface FeedbackData {
    message: string;
    category: 'bug' | 'suggestion' | 'complaint' | 'feature_request' | 'other';
    stackTrace?: string;
    userAgent?: string;
    errorUrl?: string;
    appVersion?: string;
}

export const submitFeedback = async (data: FeedbackData) => {
    const response = await api.post('/feedback', data);
    return response.data;
};

export const submitBugReport = async (msg: string, err?: Error) => {
    const data: FeedbackData = {
        message: msg,
        category: 'bug',
        stackTrace: err?.stack,
        userAgent: navigator.userAgent,
        errorUrl: window.location.href,
        appVersion: '1.0.0' // Should ideally come from config or env
    };
    const response = await api.post('/feedback/bug', data);
    return response.data;
};

export const getMyFeedback = async () => {
    const response = await api.get('/feedback/mine');
    return response.data;
};
