/**
 * ORANGE FINANCE: Branded Email Templates
 * Professional HTML templates for automated notifications.
 */

export const getBrandedTemplate = (title, content, userName) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fff7ed; padding: 20px; }
        .container { background-color: white; border-radius: 24px; padding: 40px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #ffedd5; }
        .header { display: flex; align-items: center; margin-bottom: 30px; }
        .logo { background: linear-gradient(to top right, #f97316, #f43f5e); width: 40px; height: 40px; border-radius: 12px; display: inline-block; }
        .brand { font-size: 24px; font-weight: bold; color: #1e293b; margin-left: 12px; letter-spacing: -0.02em; }
        .user-greeting { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 10px; }
        .content { color: #475569; line-height: 1.6; font-size: 15px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
        .btn { background-color: #0f172a; color: white !important; padding: 12px 30px; border-radius: 14px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px; }
        .highlight-box { background-color: #fff7ed; padding: 20px; border-radius: 18px; border: 1px dashed #fdba74; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="logo"></span>
            <span class="brand">Orange Finance</span>
        </div>
        
        <div class="user-greeting">Hi ${userName || 'there'},</div>
        
        <div class="content">
            <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 15px;">${title}</h2>
            ${content}
        </div>

        <div class="footer">
            &copy; ${new Date().getFullYear()} Swinfosystems • Secure • Private • Efficient<br>
            Managed via <a href="https://fin.swinfosystems.online" style="color: #f97316;">fin.swinfosystems.online</a>
        </div>
    </div>
</body>
</html>
`;

export const getTransactionAlertTemplate = (tx, userName) => {
    const isIncome = tx.type === 'income';
    const amountStr = `Rs ${tx.amount.toLocaleString()}`;

    return getBrandedTemplate(
        'Transaction Alert',
        `
    <p>A new ${tx.type} has been recorded in your account.</p>
    <div class="highlight-box">
        <div style="font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Details</div>
        <div style="font-size: 18px; font-weight: 900; color: ${isIncome ? '#059669' : '#e11d48'}; margin-top: 5px;">
            ${isIncome ? '+' : '-'}${amountStr}
        </div>
        <div style="font-size: 14px; font-weight: bold; color: #1e293b; margin-top: 2px;">${tx.title}</div>
        <div style="font-size: 11px; font-weight: bold; color: #64748b; margin-top: 5px;">Category: ${tx.category}</div>
    </div>
    <p>You can view your updated ledger and analytics dashboard anytime using the button below.</p>
    <a href="https://fin.swinfosystems.online" class="btn">View Dashboard</a>
    `,
        userName
    );
};
