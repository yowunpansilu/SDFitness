#!/bin/bash

# Configuration
BACKEND_URL="http://localhost:5005/api/payments/notify"
MERCHANT_ID="1235234"
MERCHANT_SECRET="NDI5MDE5NjQ5NDkyMTc5MjYzMTM0MDA5MzYwOTM1ODQ4MzcxMzI="
ORDER_ID="SDF-TEST-12345"
AMOUNT="2500.00"
CURRENCY="LKR"
STATUS_CODE="2" # 2 = Success

echo "🚀 Simulating PayHere Notification for Order: $ORDER_ID"

# Generate MD5 Sig using node
MD5_SIG=$(node -e "
const crypto = require('crypto');
const secret = '$MERCHANT_SECRET';
const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
const raw = '$MERCHANT_ID' + '$ORDER_ID' + '$AMOUNT' + '$CURRENCY' + '$STATUS_CODE' + hashedSecret;
console.log(crypto.createHash('md5').update(raw).digest('hex').toUpperCase());
")

echo "🔑 Generated MD5Sig: $MD5_SIG"

# Send Curl Request
curl -X POST $BACKEND_URL \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "merchant_id=$MERCHANT_ID&order_id=$ORDER_ID&payment_id=PAYHERE-TEST-001&payhere_amount=$AMOUNT&payhere_currency=$CURRENCY&status_code=$STATUS_CODE&md5sig=$MD5_SIG&method=VISA&status_message=Success"

echo -e "\n\n✅ Done. Check backend logs for processing status."
