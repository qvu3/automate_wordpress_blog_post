# WordPress API Setup Guide

This guide will help you set up the WordPress REST API credentials needed for the auto-post script.

## Finding Your WordPress API URL

For your WordPress site at `https://umedoc.com`, the REST API URL is:

```
https://umedoc.com/wp-json/wp/v2/posts
```

This is automatically constructed by the script using your base WordPress URL.

## Creating an Application Password

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

## Testing Your WordPress API Connection

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

## WordPress REST API Documentation

For more information about the WordPress REST API:

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Posts Endpoint Documentation](https://developer.wordpress.org/rest-api/reference/posts/)
