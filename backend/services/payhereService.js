const axios = require('axios');

class PayHereService {
    constructor() {
        this.appId = process.env.PAYHERE_APP_ID;
        this.appSecret = process.env.PAYHERE_APP_SECRET;
        this.isSandbox = process.env.PAYHERE_SANDBOX === 'true';
        this.baseUrl = this.isSandbox 
            ? 'https://sandbox.payhere.lk/merchant/v1' 
            : 'https://www.payhere.lk/merchant/v1';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    /**
     * Get OAuth2 Access Token
     */
    async getAccessToken() {
        // If token exists and is not expired (buffer of 60s), reuse it
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
            return this.accessToken;
        }

        try {
            const authHeader = Buffer.from(`${this.appId}:${this.appSecret}`).toString('base64');
            const response = await axios.post(
                `${this.baseUrl.replace('/v1', '')}/oauth/token`,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${authHeader}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            return this.accessToken;
        } catch (error) {
            console.error('PayHere Auth Error:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with PayHere Business API');
        }
    }

    /**
     * Retrieve Payment Details by Order ID
     */
    async getPaymentDetails(orderId) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.get(`${this.baseUrl}/payment/search?order_id=${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.status === 1 && response.data.data && response.data.data.length > 0) {
                return response.data.data[0]; // Return the first matching payment
            }
            return null;
        } catch (error) {
            console.error('PayHere Retrieval Error:', error.response?.data || error.message);
            throw new Error('Failed to retrieve payment details from PayHere');
        }
    }

    /**
     * Charge a saved customer token (Automated Charging)
     */
    async chargeSubscription(data) {
        try {
            const token = await this.getAccessToken();
            const response = await axios.post(`${this.baseUrl}/payment/charge`, {
                customer_token: data.customerToken,
                order_id: data.orderId,
                amount: data.amount,
                currency: data.currency || 'LKR',
                items: data.items || 'SDFitness Subscription Charge'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            return response.data;
        } catch (error) {
            console.error('PayHere Charging Error:', error.response?.data || error.message);
            throw new Error('Failed to process automated charging');
        }
    }
}

module.exports = new PayHereService();
