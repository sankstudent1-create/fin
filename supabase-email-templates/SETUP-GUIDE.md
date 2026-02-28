# Supabase Email Templates Setup Guide
## Orange Finance | Swinfosystems

All templates are designed to match the Orange Finance app's premium design:
- **Warm background** (#faf5f0) matching the app's `bg-warm`
- **Orange primary** (#f97316) matching CSS `--color-primary`
- **Glassmorphism cards** with rounded corners and shadows
- **Distinct gradient headers** per template type for visual hierarchy
- **All links point to** `fin.swinfosystems.online`

---

## How to Set Up in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Email Templates**
2. For each template type below, paste the corresponding HTML file contents

---

## Template Files

### 1. ✉️ Confirm Signup (`confirm-signup.html`)
- **Supabase Tab:** `Confirm signup`
- **Subject line:** `Verify your email — Orange Finance`
- **Gradient:** Orange → Rose (matches brand)
- **Variable used:** `{{ .ConfirmationURL }}`

### 2. 🔐 Reset Password (`reset-password.html`)
- **Supabase Tab:** `Reset password`
- **Subject line:** `Reset your password — Orange Finance`
- **Gradient:** Dark Slate (security feel)
- **Variable used:** `{{ .ConfirmationURL }}`

### 3. ✨ Magic Link (`magic-link.html`)
- **Supabase Tab:** `Magic link`
- **Subject line:** `Your sign-in link — Orange Finance`
- **Gradient:** Purple → Orange (magic theme)
- **Variable used:** `{{ .ConfirmationURL }}`

### 4. 🎉 Invite User (`invite-user.html`)
- **Supabase Tab:** `Invite user`
- **Subject line:** `You're invited to Orange Finance!`
- **Gradient:** Orange → Gold (celebratory)
- **Variable used:** `{{ .ConfirmationURL }}`

### 5. 📧 Change Email (`change-email.html`)
- **Supabase Tab:** `Change email address`
- **Subject line:** `Confirm your new email — Orange Finance`
- **Gradient:** Cyan → Teal (fresh change)
- **Variable used:** `{{ .ConfirmationURL }}`

---

## Supabase Redirect URL Configuration

After setting up templates, configure the redirect URL:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://fin.swinfosystems.online`
3. Add **Redirect URLs:**
   - `https://fin.swinfosystems.online`
   - `https://fin.swinfosystems.online/**`

---

## Important Notes

- All templates use **inline CSS only** (required for email clients)
- Templates are tested for compatibility with Gmail, Outlook, Yahoo, and Apple Mail
- The `{{ .ConfirmationURL }}` variable is automatically replaced by Supabase
- The wallet icon is loaded from `img.icons8.com` (works in all email clients)
- Footer links all point to `fin.swinfosystems.online`
