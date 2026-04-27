const crypto = require('crypto');

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Values for testing (Match your initiate logic or provided example)
const MERCHANT_ID = process.env.MERCHANT_ID;
const MERCHANT_SECRET = process.env.MERCHANT_SECRET;
const ORDER_ID = process.env.ORDER_ID;
const AMOUNT = 2500;
const CURRENCY = 'LKR';

function generateHash(merchantId, orderId, amount, currency, merchantSecret) {
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const amountFormated = parseFloat(amount).toFixed(2);

    console.log('--- Step by Step Hash Debug ---');
    console.log('Merchant ID:', merchantId);
    console.log('Order ID:', orderId);
    console.log('Amount Formatted:', amountFormated);
    console.log('Currency:', currency);
    console.log('Hashed Secret:', hashedSecret);

    const rawString = merchantId + orderId + amountFormated + currency + hashedSecret;
    console.log('Raw String:', rawString);

    const hash = crypto.createHash('md5')
        .update(rawString)
        .digest('hex')
        .toUpperCase();

    return hash;
}

const hash = generateHash(MERCHANT_ID, ORDER_ID, AMOUNT, CURRENCY, MERCHANT_SECRET);
console.log('\nFinal Hash:', hash);
console.log('Verify this with PayHere Sandbox tools if possible.');
