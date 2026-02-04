import Razorpay from 'razorpay';

export default async function handler(req, res) {
    // Set CORS headers for Vercel
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount, currency = 'INR' } = req.body;

    if (!amount) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    try {
        const instance = new Razorpay({
            key_id: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);
        return res.status(200).json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
