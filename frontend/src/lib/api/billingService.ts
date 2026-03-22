
// Types
export interface PaymentMethod {
    id: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'paypal';
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
}

export type TransactionStatus = 'paid' | 'pending' | 'failed';

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    status: TransactionStatus;
    invoiceUrl: string;
}

export interface BillingSummary {
    nextBillingDate: string;
    nextBillingAmount: number;
    currency: string;
}

// Mock Data
export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'pm_1',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2028,
        isDefault: true
    },
    {
        id: 'pm_2',
        brand: 'mastercard',
        last4: '8888',
        expiryMonth: 5,
        expiryYear: 2027,
        isDefault: false
    }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
    {
        id: 'tx_1',
        date: '2024-01-15T10:00:00Z',
        amount: 59.99,
        description: 'Pro Plan - Monthly Subscription',
        status: 'paid',
        invoiceUrl: '#'
    },
    {
        id: 'tx_2',
        date: '2023-12-15T10:00:00Z',
        amount: 59.99,
        description: 'Pro Plan - Monthly Subscription',
        status: 'paid',
        invoiceUrl: '#'
    },
    {
        id: 'tx_3',
        date: '2023-11-15T10:00:00Z',
        amount: 59.99,
        description: 'Pro Plan - Monthly Subscription',
        status: 'paid',
        invoiceUrl: '#'
    },
    {
        id: 'tx_4',
        date: '2023-10-15T10:00:00Z',
        amount: 59.99,
        description: 'Pro Plan - Monthly Subscription',
        status: 'failed',
        invoiceUrl: '#'
    }
];

// Service
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_PAYMENT_METHODS), 600));
};

export const getTransactions = async (): Promise<Transaction[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_TRANSACTIONS), 800));
};

export const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                ...method,
                id: `pm_${Math.random().toString(36).substr(2, 9)}`
            });
        }, 1200);
    });
};


export const deletePaymentMethod = async (id: string): Promise<void> => {
    // Mock deletion
    console.log('Deleting payment method', id);
    return new Promise((resolve) => setTimeout(resolve, 800));
};

export const setDefaultPaymentMethod = async (id: string): Promise<void> => {
    // Mock set default
    console.log('Setting default payment method', id);
    return new Promise((resolve) => setTimeout(resolve, 600));
};
