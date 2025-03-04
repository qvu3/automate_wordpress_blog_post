# Auto Post WordPress

A Node.js script that automates the process of generating blog posts with OpenAI or Claude and posting them to WordPress.

## Features

- Generate blog post content using AI models (OpenAI GPT or Claude)
- Support for generating and posting multiple blog posts from a single prompt
- Automatically format the content for WordPress
- Post directly to your WordPress site via the REST API
- Configurable post status (draft, publish, etc.)
- Works with Wordfence Login Security protected WordPress sites

## Setup

1. Clone this repository:

   ```
   git clone https://github.com/yourusername/auto_post_wordpress.git
   cd auto_post_wordpress
   ```

2. Install the required dependencies:

   ```
   npm install
   ```

3. Create a `.env` file based on the provided `.env.example`:

   ```
   cp .env.example .env
   ```

4. Edit the `.env` file with your credentials:

   - For AI services:
     - Get an OpenAI API key from [OpenAI's platform](https://platform.openai.com/api-keys)
     - Get an Anthropic/Claude API key from [Anthropic's console](https://console.anthropic.com/)
   - For WordPress, you'll need:
     - Your WordPress site URL (base URL without /wp-admin)
     - Your WordPress username
     - Your WordPress password

5. Log in to WordPress:

   ```
   npm run login
   ```

   This will handle the Wordfence Login Security verification and save your authentication cookies.

6. Verify your setup:

   ```
   # Check your AI API keys
   npm run check-api

   # Check your WordPress connection
   npm run check
   ```

## Usage

### Basic Usage

Run the script and enter your prompt when prompted:

```
npm start
```

Or directly:

```
node auto_post_wordpress.js
```

### Command Line Arguments

You can also provide arguments directly:

```
node auto_post_wordpress.js --prompt "Write a blog post about the benefits of automation" --status draft
```

Available arguments:

- `--prompt`: The prompt to send to the AI
- `--title`: Custom title for the blog post (optional)
- `--model`: AI model to use (default: "gpt-3.5-turbo", or use "claude-3-5-sonnet-20240620" for Claude)
- `--status`: WordPress post status (default: "draft", options: "draft", "publish", "pending", etc.)

### Global Installation

You can install the script globally to run it from anywhere:

```
npm install -g .
auto-post-wordpress --prompt "Your prompt here"
```

### Generating Multiple Blog Posts

You can generate multiple blog posts in a single request by crafting your prompt appropriately:

```
node auto_post_wordpress.js --prompt "Write 3 separate blog posts about: 1) The benefits of automation, 2) How AI is changing content creation, and 3) Best practices for WordPress SEO"
```

The script will automatically detect multiple blog posts in the AI's response and post each one separately to WordPress. It recognizes common patterns like:

- Numbered blog posts (e.g., "# Blog 1", "# Blog 2")
- Numbered articles (e.g., "# Article 1", "# Article 2")
- Numbered lists (e.g., "1. First blog post", "2. Second blog post")

Each detected blog post will be processed and posted individually to your WordPress site.

## WordPress Authentication

This script uses cookie-based authentication to work with WordPress sites protected by Wordfence Login Security.

### Recommended Setup

For the script to work properly with Wordfence, we recommend:

1. **Configure Wordfence Settings**:

   - Log in to your WordPress admin dashboard
   - Go to Wordfence > Login Security > Settings
   - Disable reCAPTCHA and email verification for API access
   - Whitelist your IP address if possible

2. **Simple Authentication Process**:
   - Run `npm run login` to authenticate with WordPress
   - The script will store authentication cookies for future use
   - Cookies will typically last for 14 days before requiring re-login

### Alternative Methods

If you cannot modify Wordfence settings, these alternatives are available:

1. **Manual Cookie Input**: If direct login fails, use `npm run manual-login`
2. **REST API Authentication Plugins**: Consider installing plugins like JWT Authentication
3. **XML-RPC API**: An older API that might not be affected by Wordfence

For more details, see the [WordPress Authentication Setup Guide](WORDPRESS_AUTH_SETUP.md).

## Troubleshooting

If you encounter issues:

1. **Check your API keys**: Run `npm run check-api` to verify your AI API keys are valid
2. **Check your WordPress connection**: Run `npm run check` to test your WordPress API connection
3. **Refresh your WordPress login**: Run `npm run login` if your authentication has expired
4. **Review error messages**: The script provides detailed error messages to help diagnose issues

## Healthcare Blog Post Generator

A specialized script is included for generating healthcare and weight loss content:

```
npm run healthcare
```

This command runs a script with a hardcoded prompt specifically designed for healthcare content:

"Generate a new blog post on innovative Healthcare and Weightloss strategies. Length: 2,100-2,400 words. Include a title, body, summary, seo tags."

The script ensures that:

1. The content is treated as a single blog post, even if it contains numbered sections or lists
2. The post is formatted using a professional healthcare blog template with:
   - Featured images with captions
   - Two-column layout with sidebar
   - Properly formatted headings, lists, and paragraphs
   - Summary section with bullet points
   - Doctor review section
   - SEO tags automatically extracted from the content
   - Ad placements and recent posts widget

This template matches the professional look and feel of existing healthcare posts on your WordPress site, ensuring consistent branding and user experience.

## Customization

You can modify the `formatBlogPost` function to customize how the generated content is formatted before posting to WordPress.

## Scheduling Automated Posts

You can schedule the healthcare post generator to run automatically using cron jobs. A scheduling script is included in the repository.

### Quick Setup

1. Run the helper script to get the full path for your crontab:

   ```
   npm run cron-path
   ```

2. Edit your crontab and add the suggested entry:

   ```
   crontab -e
   ```

3. For three times a week (Monday, Wednesday, Friday at 9 AM):

   ```
   0 9 * * 1,3,5 /full/path/to/auto_post_wordpress/schedule_healthcare_posts.sh
   ```

### Detailed Instructions

For detailed instructions specific to macOS, see the [Scheduling Guide](SCHEDULING_GUIDE.md).

This guide includes:

- Step-by-step setup instructions
- macOS-specific considerations
- Alternative scheduling with launchd
- Troubleshooting tips
- Testing procedures

## License

MIT
