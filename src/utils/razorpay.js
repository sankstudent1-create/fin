/**
 * Razorpay lazy-loader — loads checkout.js ONLY when handlePayment is called.
 * This eliminates the 'otp-credentials' and 'web-share' console warnings
 * that appear when checkout.js is loaded globally on every page.
 */

const RAZORPAY_SDK = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
        // Already loaded
        if (window.Razorpay) { resolve(); return; }

        // Already injected but not yet loaded
        const existing = document.querySelector(`script[src="${RAZORPAY_SDK}"]`);
        if (existing) {
            existing.addEventListener('load', resolve);
            existing.addEventListener('error', reject);
            return;
        }

        // Inject fresh
        const script = document.createElement('script');
        script.src = RAZORPAY_SDK;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
        document.head.appendChild(script);
    });
};

export const handlePayment = async ({ amount, user, onSuccess, onError }) => {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_eHd58tRmG5jWXe';

    try {
        await loadRazorpayScript();
    } catch {
        if (onError) onError({ description: 'Razorpay SDK failed to load. Check your internet connection.' });
        return;
    }

    const domain = window.location.hostname;
    const username = user?.user_metadata?.full_name || 'User';

    const options = {
        key: keyId,
        amount: amount * 100, // paise
        currency: 'INR',
        name: 'Fin by Swinfosystems',
        description: `Support by ${username} to Fin by Swinfosystems for ${domain}.`,
        image: 'https://api.dicebear.com/7.x/shapes/svg?seed=orange',
        handler: (response) => {
            if (onSuccess) onSuccess(response);
        },
        prefill: {
            name: username,
            email: user?.email || '',
            contact: '',
        },
        notes: {
            app_name: 'Orange Finance',
            supporter: username,
            domain,
        },
        theme: { color: '#f97316' },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
        if (onError) onError(response.error);
    });
    rzp.open();
};
