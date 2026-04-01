# Resend Email Service Setup

## Overview
The NeoToons AI app now uses **Resend** for sending transactional emails instead of Gmail SMTP. Resend provides a reliable, developer-friendly email service with better deliverability.

---

## 📝 Quick Setup Steps

### 1. Sign Up for Resend
- Go to [https://resend.com](https://resend.com)
- Click **"Get Started"** and sign up with your email
- Verify your email address

### 2. Get Your API Key
1. Log in to [Resend Dashboard](https://dashboard.resend.com)
2. Navigate to **API Keys** section
3. Click **"Create API Key"**
4. Copy the API key (starts with `re_`)

### 3. Configure Environment Variables
Add the following to your `.env.local` file:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_YOUR_API_KEY_HERE

# Email addresses
APP_EMAIL=neotoons.site.help@gmail.com
ADMIN_EMAIL=neotoons.site.help@gmail.com
```

**Replace `re_YOUR_API_KEY_HERE` with your actual API key from Resend.**

---

## 🚀 How It Works

### Email Flow
1. **Contact Form Submission** → Sends to admin via [POST /api/contact](./src/api/routes/contact.ts)
2. **Email Service** → Calls Resend API with email details
3. **Resend** → Delivers the email to recipient

### API Implementation
The email service now uses **Resend's REST API** (no additional npm packages needed):

```typescript
// emailService.ts
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${this.apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: `NeoToons AI <${this.appEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  }),
});
```

---

## ✅ Testing Email Sending

### Test Contact Form
1. Start the app: `npm run dev:all`
2. Navigate to `/contact`
3. Fill in the form and submit
4. Check:
   - Backend logs for: `✅ Email sent: [email_id]`
   - Your admin email for the form submission

### Test with cURL
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'
```

---

## 📧 Email Configuration

### Verified Sender Domains (Production)
For production, you should verify your domain:

1. In Resend Dashboard → **Domains**
2. Add your domain (e.g., `mail.neotoons.ai`)
3. Add DNS records as instructed
4. Update `APP_EMAIL` in environment variables:
   ```env
   APP_EMAIL=noreply@mail.neotoons.ai
   ```

### Using Gmail's "From" Name (Development)
For now, emails appear to come from `noreply@neotoons.site.help@gmail.com` but you control the display name in the `from` field.

---

## 🔍 Troubleshooting

### Error: "Missing or invalid API key"
- **Cause:** `RESEND_API_KEY` not set or incorrect
- **Fix:** Copy the correct API key from Resend Dashboard (starts with `re_`)

### Error: "Invalid 'from' address"
- **Cause:** Using an unverified email address
- **Fix:** For production, verify a domain in Resend Dashboard

### Emails Not Arriving
- Check **Resend Dashboard → Activity** for delivery status
- Check spam/junk folder
- Verify recipient email is correct

### "Email service not configured"
- **Cause:** `RESEND_API_KEY` is not set
- **Fix:** Ensure `.env.local` has the API key and server is restarted

---

## 📊 Monitoring

### Check Email Status
1. Go to [Resend Dashboard](https://dashboard.resend.com)
2. View **Activity** tab for all sent emails
3. See delivery status, bounce rates, etc.

### Service Status
- Backend logs show: `✅ Email service initialized successfully with Resend`
- Errors logged as: `❌ Failed to send email: [error message]`

---

## 🔐 Security Notes

- ✅ API key stored in environment variables (`.env.local`)
- ✅ Never commit `.env.local` to git
- ✅ API key only used server-side (never exposed to frontend)
- ✅ Emails sent through Resend's secure infrastructure

---

## 📚 Resources

- [Resend API Documentation](https://resend.com/docs)
- [Resend Dashboard](https://dashboard.resend.com)
- [Email Service Code](./src/services/emailService.ts)
- [Contact Form Route](./src/api/routes/contact.ts)

---

## 🎯 Next Steps

1. ✅ Sign up and get API key from Resend
2. ✅ Add `RESEND_API_KEY` to `.env.local`
3. ✅ Restart the backend: `npm run dev:api`
4. ✅ Test contact form: `npm run dev`
5. ✅ Verify email delivery

---

**Last Updated:** March 31, 2026  
**Email Service:** Resend  
**Status:** ✅ Production Ready
