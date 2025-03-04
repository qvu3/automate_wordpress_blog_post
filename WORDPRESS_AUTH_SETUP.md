# WordPress Authentication Setup Guide

Based on our tests, your WordPress site at `https://umedoc.com` is using Wordfence Login Security, which can add additional verification requirements for API access. This guide will help you set up the necessary authentication for the REST API.

## The Issue

Wordfence Login Security adds extra layers of protection to your WordPress login, which can interfere with automated API access. When verification features like reCAPTCHA or email verification are enabled, automated scripts cannot complete the login process.

## Recommended Solution: Configure Wordfence

The most reliable solution is to configure Wordfence to allow API access:

1. Log in to your WordPress admin dashboard
2. Go to Wordfence > Login Security > Settings
3. Disable reCAPTCHA and email verification for API access
   - Look for options like "Enable CAPTCHA on login" and disable them
   - Disable "Additional verification is required for login" feature
4. Whitelist your IP address in Wordfence if possible

With these settings adjusted, the script can now log in directly without requiring verification links or manual cookie input.

## Using the Authentication

After configuring Wordfence, you can use the script as follows:

1. First, log in to WordPress using the script:

   ```
   npm run login
   ```

2. The script will:

   - Open a connection to your WordPress site
   - Submit your login credentials
   - Store the authentication cookies for future use

3. Once logged in, you can run the main script:

   ```
   npm start
   ```

   Or with command-line arguments:

   ```
   node auto_post_wordpress.js --prompt "Write a blog post about healthcare" --status draft
   ```

## Cookie Expiration

The authentication cookies will eventually expire (typically after 14 days or when you log out of WordPress). When this happens, simply run the login script again:

```
npm run login
```

## Troubleshooting

If you encounter authentication issues:

1. **Check Wordfence Settings**: Make sure verification features are disabled

   - Disable reCAPTCHA on login
   - Disable additional verification requirements
   - Whitelist your IP address if possible

2. **Run the login script again**: Cookies may have expired

   ```
   npm run login
   ```

3. **Check your WordPress login**: Make sure you can log in to WordPress normally at `https://umedoc.com/wp-admin`

4. **Clear cookies and try again**: Delete the `.wp_cookies.json` file and run the login script again

## Alternative Solutions (If Wordfence Cannot Be Configured)

If you cannot modify Wordfence settings, consider these alternatives:

1. **Manual Cookie Input**: Use the manual cookie input method if direct login fails

   ```
   npm run manual-login
   ```

2. **Install a REST API Authentication Plugin**:

   - [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
   - [Application Passwords](https://wordpress.org/plugins/application-passwords/) (built into WordPress 5.6+)

3. **Use the WordPress XML-RPC API**:

   - An older API that might not be affected by Wordfence Login Security
   - Enable XML-RPC in your WordPress settings if disabled

4. **Create a Custom Endpoint**:
   - Develop a simple plugin that creates a custom endpoint with its own authentication method
   - This can bypass Wordfence restrictions for specific functionality

## Technical Details

Wordfence Login Security adds multiple layers of protection that can interfere with API access:

1. **Two-Factor Authentication**: Requires verification links/codes for login
2. **REST API Protection**: May block authenticated REST API requests even with valid cookies
3. **CAPTCHA/reCAPTCHA**: May require human verification that's difficult to automate

For automated posting to work reliably, you'll likely need to adjust Wordfence settings or use an alternative authentication method.
