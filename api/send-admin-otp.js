import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    // Pass the user's authorization header down to the database so that auth.uid() resolves correctly!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, authHeader ? {
        global: { headers: { Authorization: authHeader } }
    } : {});

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email required' });

        if (!authHeader) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        // 1. Generate OTP using the parameterless RPC function
        const { data: otpCode, error: rpcError } = await supabase.rpc('generate_admin_otp');

        if (rpcError || !otpCode) {
            console.error(rpcError);
            return res.status(403).json({ error: 'Failed to generate OTP. Make sure you are an admin.' });
        }

        // 2. Send the OTP via Email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.VITE_SMTP_USER,
                pass: process.env.VITE_SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"Orange Finance Security" <${process.env.VITE_SMTP_USER}>`,
            to: email,
            subject: 'Admin 2FA Authorization Code',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 40px; text-align: center;">
                    <div style="max-w: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                        <img src="https://fin.swinfosystems.online/favicon.ico" alt="Orange Finance Logo" width="60" style="margin-bottom: 20px;" />
                        <h2 style="color: #0f172a; margin: 0 0 10px 0;">Admin Portal Access</h2>
                        <p style="color: #64748b; font-size: 14px; margin-bottom: 30px;">
                            You are attempting to access the high-security admin dashboard. 
                            Please use the authorization code below:
                        </p>
                        
                        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 30px;">
                            <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #4f46e5; font-family: monospace;">${otpCode}</span>
                        </div>
                        
                        <p style="color: #94a3b8; font-size: 12px;">This code expires in 10 minutes. If you did not request this, please secure your account.</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'OTP Sent successfully' });

    } catch (err) {
        console.error('OTP Send Error:', err);
        return res.status(500).json({ error: 'Failed to send OTP.' });
    }
}
