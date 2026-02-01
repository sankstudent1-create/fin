/**
 * ORANGE FINANCE: Email Service
 * Handles communication with Supabase Edge Functions for sending branded emails.
 */

import { getTransactionAlertTemplate } from './emailTemplates';

export const emailService = {
    /**
     * Sends a branded email using a Supabase Edge Function.
     * Note: This requires the 'send-notification' Edge Function to be deployed.
     */
    async sendEmail(supabase, { to, subject, html }) {
        try {
            if (!supabase) throw new Error("Supabase client not initialized.");

            // We call our custom Edge Function 'send-notification'
            const { data, error } = await supabase.functions.invoke('send-notification', {
                body: { to, subject, html },
            });

            if (error) throw error;
            return { success: true, data };
        } catch (err) {
            console.error("Email Service Error:", err);
            return { success: false, error: err.message };
        }
    },

    /**
     * Specifically handles transaction alerts
     */
    async sendTransactionAlert(supabase, user, transaction) {
        // Only send for large transactions (> 10,000) or as a demonstration
        if (transaction.amount < 5000) return;

        const html = getTransactionAlertTemplate(transaction, user.user_metadata?.full_name);

        return this.sendEmail(supabase, {
            to: user.email,
            subject: `Orange Finance: New ${transaction.type} recorded (${transaction.title})`,
            html
        });
    }
};
