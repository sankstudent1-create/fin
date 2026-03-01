import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { to, subject, reportName, filterLabel, stats, pdfBase64 } = req.body;

        if (!to || !pdfBase64) {
            return res.status(400).json({ error: 'Missing required fields: to, pdfBase64' });
        }

        // SMTP config from Vercel env variables
        const smtpPort = parseInt(process.env.SMTP_PORT || '587');

        // Auto-detect SSL: port 465 = SSL, port 587 = STARTTLS
        const isSecure = smtpPort === 465;

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return res.status(500).json({ error: 'SMTP credentials not configured. Add SMTP_HOST, SMTP_USER, SMTP_PASS to Vercel env.' });
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: smtpPort,
            secure: isSecure,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                // Don't fail on self-signed certs
                rejectUnauthorized: false,
            },
        });

        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;
        const fileName = reportName || `Fin_Report_${Date.now()}.pdf`;
        const periodLabel = filterLabel || 'Custom Period';

        // Build premium email HTML
        const emailHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#fff7ed;font-family:'Outfit','Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff7ed;padding:40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;">

                    <!-- Logo Header -->
                    <tr>
                        <td align="center" style="padding-bottom:32px;">
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="vertical-align:middle;">
                                        <img src="https://fin.swinfosystems.online/favicon.ico" alt="Orange Finance" width="44" height="44" style="display:block;border-radius:12px;">
                                    </td>
                                    <td style="padding-left:14px;vertical-align:middle;">
                                        <span style="font-family:'Outfit',sans-serif;font-size:22px;font-weight:900;color:#1e293b;letter-spacing:-0.5px;">Orange Finance</span>
                                        <br>
                                        <span style="font-family:'Outfit',sans-serif;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;">by Swinfosystems</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Main Card -->
                    <tr>
                        <td>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,0.06);border:1px solid rgba(255,255,255,0.8);overflow:hidden;">

                                <!-- Gradient Banner -->
                                <tr>
                                    <td style="background:linear-gradient(135deg,#f97316 0%,#f59e0b 50%,#ef4444 100%);padding:40px 40px 32px;text-align:center;">
                                        <div style="width:72px;height:72px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 20px;line-height:72px;border:2px solid rgba(255,255,255,0.2);">
                                            <span style="font-size:36px;">📊</span>
                                        </div>
                                        <h1 style="margin:0;font-family:'Outfit',sans-serif;font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                                            Your Financial Report</h1>
                                        <p style="margin:8px 0 0;font-family:'Outfit',sans-serif;font-size:14px;color:rgba(255,255,255,0.85);font-weight:500;">
                                            Period: ${periodLabel}</p>
                                    </td>
                                </tr>

                                <!-- Body Content -->
                                <tr>
                                    <td style="padding:36px 40px 20px;">
                                        <p style="margin:0 0 16px;font-family:'Outfit',sans-serif;font-size:16px;color:#334155;line-height:1.7;font-weight:600;">
                                            Hi there! 📊
                                        </p>
                                        <p style="margin:0 0 24px;font-family:'Outfit',sans-serif;font-size:15px;color:#475569;line-height:1.7;">
                                            Your financial intelligence report from <strong style="color:#f97316;">Orange Finance</strong> is attached below as a PDF. Here's a quick summary:
                                        </p>

                                        <!-- Stats Cards -->
                                        ${stats ? `
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                                            <tr>
                                                <td width="33%" style="padding:4px;">
                                                    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px;text-align:center;">
                                                        <p style="margin:0;font-family:'Outfit',sans-serif;font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;">Income</p>
                                                        <p style="margin:4px 0 0;font-family:'Outfit',sans-serif;font-size:18px;font-weight:900;color:#15803d;">₹${stats.income?.toLocaleString() || '0'}</p>
                                                    </div>
                                                </td>
                                                <td width="33%" style="padding:4px;">
                                                    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px;text-align:center;">
                                                        <p style="margin:0;font-family:'Outfit',sans-serif;font-size:10px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:1px;">Expense</p>
                                                        <p style="margin:4px 0 0;font-family:'Outfit',sans-serif;font-size:18px;font-weight:900;color:#b91c1c;">₹${stats.expense?.toLocaleString() || '0'}</p>
                                                    </div>
                                                </td>
                                                <td width="33%" style="padding:4px;">
                                                    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:14px;text-align:center;">
                                                        <p style="margin:0;font-family:'Outfit',sans-serif;font-size:10px;font-weight:700;color:#ea580c;text-transform:uppercase;letter-spacing:1px;">Net</p>
                                                        <p style="margin:4px 0 0;font-family:'Outfit',sans-serif;font-size:18px;font-weight:900;color:#c2410c;">₹${stats.balance?.toLocaleString() || '0'}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                        ` : ''}

                                        <p style="margin:0 0 8px;font-family:'Outfit',sans-serif;font-size:13px;color:#64748b;line-height:1.6;">
                                            📎 <strong>PDF Report attached</strong> — open it for the complete transaction history and analysis.
                                        </p>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="padding:12px 40px 36px;">
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                                            <tr>
                                                <td style="padding:14px 18px;">
                                                    <p style="margin:0;font-family:'Outfit',sans-serif;font-size:12px;color:#64748b;line-height:1.6;">
                                                        🔒 This report was generated and emailed securely from your Orange Finance account. No one else has access to this data.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Bottom Footer -->
                    <tr>
                        <td style="padding:32px 20px 0;text-align:center;">
                            <p style="margin:0 0 6px;font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:#64748b;">
                                Orange Finance</p>
                            <p style="margin:0 0 4px;font-family:'Outfit',sans-serif;font-size:11px;color:#94a3b8;">
                                <a href="https://fin.swinfosystems.online" style="color:#f97316;text-decoration:none;font-weight:600;">fin.swinfosystems.online</a>
                            </p>
                            <p style="margin:12px 0 0;font-family:'Outfit',sans-serif;font-size:10px;color:#cbd5e1;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                                Secured by Supabase & Swinfosystems
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

        await transporter.sendMail({
            from: `"Orange Finance" <${fromEmail}>`,
            to,
            subject: subject || `📊 Your Financial Report — ${periodLabel}`,
            html: emailHTML,
            attachments: [{
                filename: fileName,
                content: Buffer.from(pdfBase64, 'base64'),
                contentType: 'application/pdf',
            }],
        });

        return res.status(200).json({ success: true, message: 'Report emailed successfully!' });

    } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: err.message || 'Failed to send email' });
    }
}
