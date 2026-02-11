export const handlePayment = ({ amount, user, description, notes, onSuccess, onError }) => {
    const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_eHd58tRmG5jWXe';

    if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Please check your internet connection.");
        return;
    }

    const options = {
        key: keyId,
        amount: amount * 100, // amount in the smallest currency unit (paise for INR)
        currency: "INR",
        name: "fin by swinfosystems",
        description: description || `Support for fin by swinfosystems`,
        image: "https://fin.swinfosystems.online/logo.png", // Use site logo
        handler: function (response) {
            if (onSuccess) onSuccess(response);
        },
        prefill: {
            name: user?.user_metadata?.full_name || "",
            email: user?.email || "",
            contact: ""
        },
        notes: notes || {
            "infrastructure_support": "agriwadi"
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
