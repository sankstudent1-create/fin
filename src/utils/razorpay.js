export const handlePayment = ({ amount, user, onSuccess, onError }) => {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_eHd58tRmG5jWXe';

    if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Please check your internet connection.");
        return;
    }

    const domain = window.location.hostname;
    const username = user?.user_metadata?.full_name || 'User';

    const options = {
        key: keyId,
        amount: amount * 100, // amount in the smallest currency unit (paise for INR)
        currency: "INR",
        name: "Fin by Swinfosystems",
        description: `Support by ${username} to Fin by Swinfosystems for ${domain}. Thanks to Agriwadi for payment infrastructure support.`,
        image: "https://api.dicebear.com/7.x/shapes/svg?seed=orange",
        handler: function (response) {
            if (onSuccess) onSuccess(response);
        },
        prefill: {
            name: username,
            email: user?.email || "",
            contact: ""
        },
        notes: {
            app_name: "Orange Finance",
            powered_by: "Agriwadi Payment Infrastructure",
            supporter: username,
            domain: domain
        },
        theme: {
            color: "#f97316"
        }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
        if (onError) onError(response.error);
    });
    rzp.open();
};
