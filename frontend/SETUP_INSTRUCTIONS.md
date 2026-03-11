# Setup Instructions for The Sewing Circle

## EmailJS Setup

1. **Create EmailJS Account**
   - Go to [https://www.emailjs.com/](https://www.emailjs.com/)
   - Sign up for a free account

2. **Create Email Service**
   - In your EmailJS dashboard, go to "Email Services"
   - Add a new service (Gmail, Outlook, etc.)
   - Follow the setup instructions for your email provider

3. **Create Email Template**
   - Go to "Email Templates" in your dashboard
   - Create a new template with these variables:
     - `{{to_email}}` - Recipient email
     - `{{from_name}}` - Sender name
     - `{{from_email}}` - Sender email
     - `{{contribution_type}}` - Volunteer or Supporter
     - `{{message}}` - Form message

   Example template:
   ```
   Subject: New Sewing Circle Member Application

   Hello,

   You have received a new member application for The Sewing Circle:

   Name: {{from_name}}
   Email: {{from_email}}
   Contribution Type: {{contribution_type}}

   Message:
   {{message}}

   Best regards,
   The Sewing Circle Website
   ```

4. **Get Your Keys**
   - Public Key: Found in "Account" section
   - Service ID: Found in your email service settings
   - Template ID: Found in your template settings

5. **Update Configuration**
   - Open `src/config/emailjs.js`
   - Replace the placeholder values with your actual keys:
     ```javascript
     export const EMAILJS_CONFIG = {
       PUBLIC_KEY: "your_actual_public_key",
       SERVICE_ID: "your_actual_service_id", 
       TEMPLATE_ID: "your_actual_template_id",
     };
     ```

## reCAPTCHA Setup

1. **Create reCAPTCHA Site**
   - Go to [https://www.google.com/recaptcha/](https://www.google.com/recaptcha/)
   - Click "Admin Console"
   - Create a new site with reCAPTCHA v2 "I'm not a robot" checkbox
   - Add your domain (for development, you can use `localhost`)

2. **Get Site Key**
   - Copy your site key from the reCAPTCHA admin console

3. **Update Configuration**
   - Open `src/config/emailjs.js`
   - Replace the test key with your actual site key:
     ```javascript
     export const RECAPTCHA_SITE_KEY = "your_actual_site_key";
     ```

## Features Implemented

✅ **Upcoming Events Tab Updates**
- Removed register buttons
- Added click functionality to redirect to "Get Involved" form
- Events are now clickable cards that open the main form

✅ **Get Involved Form Enhancements**
- Changed contribution field from textarea to dropdown
- Options: "Volunteer" and "Supporter (Non-Volunteer)"
- Added name length validation (3-20 characters)
- Added email format validation
- Integrated reCAPTCHA for security

✅ **Email Functionality**
- Form submissions send emails to both specified addresses:
  - nitin.raj.25@gmail.com
  - nitin.ghost.9@gmail.com
- Uses EmailJS for client-side email sending
- Includes all form data in the email

## Development

To run the development server:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

## Notes

- The current reCAPTCHA key is a test key that works on localhost
- Make sure to replace all placeholder keys with your actual keys before deploying
- EmailJS has a free tier with 200 emails per month
- For production, consider implementing server-side email handling for better security