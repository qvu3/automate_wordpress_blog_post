# WordPress Setup Guide

This comprehensive guide will help you set up WordPress for use with the auto-post script, including API access and authentication.

## WordPress API Setup

### Finding Your WordPress API URL

For your WordPress site at `https://umedoc.com`, the REST API URL is:

```
https://umedoc.com/wp-json/wp/v2/posts
```

This is automatically constructed by the script using your base WordPress URL.

### Creating an Application Password

To securely authenticate with the WordPress API, you need to create an application password:

1. Log in to your WordPress admin dashboard at `https://umedoc.com/wp-admin`

2. Go to **Users → Profile** (or **Users → Your Profile** if you're an admin)

3. Scroll down to the **Application Passwords** section at the bottom of the page

   - If you don't see this section, your WordPress might need to be updated or the feature might be disabled

4. Enter a name for the application (e.g., "Auto Post Script")

5. Click **Add New Application Password**

6. WordPress will generate a password. **Copy this password immediately** as it will only be shown once

7. Update your `.env` file with this password:
   ```
   WP_APP_PASSWORD=the_generated_password
   ```

## WordPress Authentication Setup

### Wordfence Considerations

If your WordPress site uses Wordfence Login Security, it can add additional verification requirements for API access. Wordfence adds extra layers of protection to your WordPress login, which can interfere with automated API access.

#### Wordfence Authentication Challenges

Wordfence Login Security on your WordPress site adds multiple layers of protection that make automated API access challenging:

1. **Two-Factor Authentication**: Requires verification links/codes for login
2. **REST API Protection**: May block authenticated REST API requests even with valid cookies
3. **CAPTCHA/reCAPTCHA**: May require human verification that's difficult to automate

### Recommended Solution: Configure Wordfence

The most reliable solution is to configure Wordfence to allow API access:

1. Log in to your WordPress admin dashboard
2. Go to Wordfence > Login Security > Settings
3. Disable reCAPTCHA and email verification for API access
   - Look for options like "Enable CAPTCHA on login" and disable them
   - Disable "Additional verification is required for login" feature
4. Whitelist your IP address in Wordfence if possible

With these settings adjusted, the script can now log in directly without requiring verification links or manual cookie input.

### Solution Implementation Details

The successful solution implemented in this project:

1. **Wordfence Configuration**: Disabled reCAPTCHA and email verification in Wordfence settings
2. **Direct Authentication**: Updated scripts to use direct login without verification steps
3. **Cookie-Based Authentication**: Maintained cookie storage for persistent authentication

With these changes, the script now successfully:

- Logs in to WordPress without requiring verification
- Posts content to WordPress via the REST API
- Maintains authentication between sessions using cookies

### Recommended Maintenance

To ensure continued functionality:

1. **Keep Wordfence Settings**: Maintain the current Wordfence configuration that allows API access
2. **Regular Re-login**: Run `npm run login` every 14 days or when cookies expire
3. **IP Whitelisting**: Consider whitelisting your IP address in Wordfence for added security

### Using the Authentication

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

### Cookie Expiration

The authentication cookies will eventually expire (typically after 14 days or when you log out of WordPress). When this happens, simply run the login script again:

```
npm run login
```

## Testing Your WordPress Connection

Run the WordPress connection checker to verify everything is set up correctly:

```
node check_wordpress.js
```

This will test:

1. If your WordPress site is reachable
2. If the REST API is enabled
3. If the posts endpoint is available
4. If your authentication credentials work

## Troubleshooting

### Authentication Issues

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

### REST API Not Available

If the REST API is not available, check:

1. Your WordPress version (should be 4.7 or higher)
2. If you have any security plugins that might be blocking the REST API
3. If your site has custom .htaccess rules blocking API access

### Authentication Fails

If authentication fails:

1. Make sure you're using an application password, not your regular login password
2. Verify the username matches your WordPress username exactly
3. Try creating a new application password

### 404 Not Found

If you get a 404 error:

1. Make sure your WordPress URL is correct in the `.env` file
2. Try visiting `https://umedoc.com/wp-json` in your browser to verify the API is accessible
3. Check if your WordPress site has a custom REST API base path

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

## Additional Resources

For more information about the WordPress REST API:

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Posts Endpoint Documentation](https://developer.wordpress.org/rest-api/reference/posts/)
