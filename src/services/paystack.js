// src/services/paystackService.js
const axios = require("axios");

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const headers = {
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
};

const PaystackService = {
  // Initialize payment
  initializePayment: async (email, amount, metadata = {}) => {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        metadata,
      },
      { headers }
    );
    return response.data;
  },

  // Verify payment
  verifyPayment: async (reference) => {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      { headers }
    );
    return response.data;
  },
};

module.exports = PaystackService;
