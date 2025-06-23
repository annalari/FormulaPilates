# Email Functionality Setup Guide

This guide explains how to set up the email functionality for the Formula Pilates application.

## Overview

The application now includes email functionality that automatically sends welcome emails to new users when they are created by an admin. The email contains:

- Welcome message
- User credentials (email and temporary password)
- Login instructions
- System usage guidelines

## Setup Instructions

### 1. Get a Resend API Key

1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (it starts with `re_`)

### 2. Configure Environment Variables

1. Open the `.env.local` file in the project root
2. Replace `your_resend_api_key_here` with your actual Resend API key:

```env
RESEND_API_KEY=re_your_actual_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:8000
```

### 3. Domain Setup (For Production)

For production use, you'll need to:

1. Add and verify your domain in Resend
2. Update the `from` email address in `src/app/api/send-email/route.ts`
3. Update `NEXT_PUBLIC_APP_URL` in your production environment

## Testing the Email Functionality

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Login as Admin

- Email: `admin@formula.com`
- Password: `admin123`

### 3. Create a New User

1. Go to the Admin Dashboard
2. Click "Adicionar Funcionário"
3. Enter an email address (use a real email you can access for testing)
4. Click "Criar Funcionário"

### 4. Check Email Delivery

- Check the email inbox for the welcome email
- The email will contain the temporary password
- Use the credentials to test login

## Pre-configured Test User

The system includes a pre-configured user for testing:

- Email: `annalarissa.mmm@gmail.com`
- Password: `test123`

## Email Template Features

The welcome email includes:

- **Professional Design**: Responsive HTML email with Formula Pilates branding
- **Secure Password Display**: Temporary password in a highlighted box
- **Security Warning**: Instructions about changing password on first login
- **Direct Login Link**: Button linking to the application
- **Usage Instructions**: Guidelines on how to use the system
- **Contact Information**: Instructions to contact admin for help

## Troubleshooting

### Email Not Sending

1. **Check API Key**: Ensure the Resend API key is correctly set in `.env.local`
2. **Check Console**: Look for error messages in the browser console or server logs
3. **Verify Domain**: In production, ensure your domain is verified in Resend
4. **Check Rate Limits**: Free Resend accounts have sending limits

### Email in Spam Folder

1. **Domain Authentication**: Set up SPF, DKIM, and DMARC records
2. **Sender Reputation**: Use a verified domain for the `from` address
3. **Content Quality**: Ensure email content doesn't trigger spam filters

### Development vs Production

- **Development**: Uses localhost URL in email links
- **Production**: Update `NEXT_PUBLIC_APP_URL` to your production domain

## Security Considerations

1. **API Key Security**: Never commit the actual API key to version control
2. **Password Generation**: Temporary passwords are randomly generated
3. **HTTPS**: Use HTTPS in production for secure email links
4. **Rate Limiting**: Consider implementing rate limiting for user creation

## File Structure

```
src/
├── app/
│   └── api/
│       └── send-email/
│           └── route.ts          # Email API endpoint and templates
├── lib/
│   └── authStore.ts             # Updated user creation with email
└── .env.local                   # Environment variables (not in git)
```

## Next Steps

1. Set up your Resend API key
2. Test the email functionality in development
3. Configure domain verification for production
4. Customize email templates as needed
5. Set up monitoring for email delivery

For any issues or questions, check the Resend documentation or contact the development team.
