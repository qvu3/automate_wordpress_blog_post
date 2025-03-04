#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables
dotenv.config();

// Get WordPress credentials from environment variables
let WP_URL = process.env.WP_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

// Fix the WordPress URL if needed
if (WP_URL && WP_URL.includes('/wp-admin')) {
  WP_URL = WP_URL.split('/wp-admin')[0];
}

// Remove trailing slash if present
if (WP_URL && WP_URL.endsWith('/')) {
  WP_URL = WP_URL.slice(0, -1);
}

// Cookie jar to store session cookies
const cookieJar = {
  cookies: [],
  setCookie(cookie, url) {
    this.cookies.push(cookie);
  },
  getCookieString(url) {
    return this.cookies.join('; ');
  }
};

// Function to get user input
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Function to save cookies to a file
function saveCookies() {
  const cookieFile = path.join(__dirname, '.wp_cookies.json');
  fs.writeFileSync(cookieFile, JSON.stringify(cookieJar.cookies));
  console.log(`Cookies saved to ${cookieFile}`);
}

// Function to load cookies from a file
function loadCookies() {
  const cookieFile = path.join(__dirname, '.wp_cookies.json');
  if (fs.existsSync(cookieFile)) {
    try {
      cookieJar.cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
      console.log(`Loaded cookies from ${cookieFile}`);
      return true;
    } catch (error) {
      console.error(`Error loading cookies: ${error.message}`);
      return false;
    }
  }
  return false;
}

// Function to manually input cookies from browser
async function manualCookieInput() {
  console.log("\n=== Manual Cookie Input ===");
  console.log("Please follow these steps to log in and get cookies:");
  console.log("1. Open your browser and go to: " + WP_URL + "/wp-login.php");
  console.log("2. Log in with your WordPress credentials");
  console.log("3. When you receive the verification email, click the link");
  console.log("4. After successful login, open your browser's developer tools:");
  console.log("   - Chrome: Right-click > Inspect > Application tab > Cookies");
  console.log("   - Firefox: Right-click > Inspect > Storage tab > Cookies");
  console.log("5. Find cookies for your WordPress domain");
  console.log("6. Copy each cookie in the format 'name=value'");
  console.log("\nEnter cookies one by one. Type 'done' when finished.\n");
  
  cookieJar.cookies = [];
  
  let cookieInput = "";
  while (cookieInput.toLowerCase() !== 'done') {
    cookieInput = await askQuestion("Enter cookie (name=value) or 'done' to finish: ");
    
    if (cookieInput.toLowerCase() !== 'done') {
      // Validate cookie format
      if (cookieInput.includes('=')) {
        cookieJar.cookies.push(cookieInput);
        console.log("Cookie added.");
      } else {
        console.log("Invalid cookie format. Please use 'name=value' format.");
      }
    }
  }
  
  if (cookieJar.cookies.length > 0) {
    saveCookies();
    return true;
  } else {
    console.log("No cookies were added.");
    return false;
  }
}

// Function to follow a verification link and get cookies
async function followVerificationLink(verificationLink) {
  try {
    console.log("Following verification link...");
    
    // Follow the verification link
    const response = await axios.get(verificationLink, {
      maxRedirects: 5,
      validateStatus: status => status >= 200 && status < 400
    });
    
    // Store cookies
    if (response.headers['set-cookie']) {
      console.log("Received cookies from verification link");
      response.headers['set-cookie'].forEach(cookie => {
        cookieJar.setCookie(cookie.split(';')[0], WP_URL);
      });
    }
    
    // Check if the verification was successful
    const $ = cheerio.load(response.data);
    if (response.data.includes('Email verification succeeded') || 
        response.data.includes('verification succeeded')) {
      console.log("✅ Email verification succeeded!");
      console.log("\nHowever, Wordfence requires a full browser login session.");
      console.log("Automatic login after verification is not supported.");
      
      // Ask if user wants to manually input cookies
      const manualInput = await askQuestion("\nWould you like to manually input cookies from your browser? (yes/no): ");
      
      if (manualInput.toLowerCase() === 'yes') {
        return await manualCookieInput();
      } else {
        console.log("\nPlease complete these steps manually:");
        console.log("1. Open your browser and go to: " + WP_URL + "/wp-login.php");
        console.log("2. Log in with your WordPress credentials");
        console.log("3. When you receive the verification email, click the link");
        console.log("4. After successful login, run this script again and choose the manual cookie input option");
        return false;
      }
    } else {
      console.log("❌ Verification link did not complete verification. Please check the link.");
      return false;
    }
  } catch (error) {
    console.error("Error following verification link:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
    }
    return false;
  }
}

// Function to log in to WordPress
async function loginToWordPress() {
  console.log("WordPress Login");
  console.log("===============");
  
  // Check if we have saved cookies
  if (loadCookies()) {
    // Test if the cookies are still valid
    try {
      console.log("Testing saved cookies...");
      const response = await axios.get(`${WP_URL}/wp-admin/`, {
        headers: {
          Cookie: cookieJar.getCookieString()
        },
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      });
      
      if (response.data.includes('wp-admin/profile.php')) {
        console.log("✅ Saved cookies are valid. You are logged in!");
        return true;
      } else {
        console.log("❌ Saved cookies are expired. Need to log in again.");
      }
    } catch (error) {
      console.log("❌ Error testing cookies:", error.message);
    }
  }
  
  console.log(`Logging in to ${WP_URL}/wp-login.php`);
  
  try {
    // First, get the login page to capture any security tokens
    const loginPageResponse = await axios.get(`${WP_URL}/wp-login.php`);
    
    // Parse the login form
    const $ = cheerio.load(loginPageResponse.data);
    
    // Extract form fields
    const formFields = {};
    $('form input').each((i, el) => {
      const name = $(el).attr('name');
      const value = $(el).attr('value');
      if (name) formFields[name] = value || '';
    });
    
    // Add username and password
    formFields.log = WP_USERNAME;
    formFields.pwd = WP_APP_PASSWORD;
    
    // Convert form fields to URL encoded format
    const formData = new URLSearchParams();
    for (const [key, value] of Object.entries(formFields)) {
      formData.append(key, value);
    }
    
    // Submit the login form
    const loginResponse = await axios.post(`${WP_URL}/wp-login.php`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': loginPageResponse.headers['set-cookie']?.join('; ') || ''
      },
      maxRedirects: 0,
      validateStatus: status => status >= 200 && status < 400
    });
    
    // Store cookies
    if (loginResponse.headers['set-cookie']) {
      loginResponse.headers['set-cookie'].forEach(cookie => {
        cookieJar.setCookie(cookie.split(';')[0], WP_URL);
      });
    }
    
    // Check if login was successful
    if (loginResponse.headers.location && 
        loginResponse.headers.location.includes('wp-admin')) {
      console.log("✅ Login successful!");
      saveCookies();
      return true;
    } else {
      console.log("❌ Login failed.");
      
      // Check if we need to handle Wordfence 2FA
      if (loginResponse.data && (
          loginResponse.data.includes('wfls-captcha-verify') || 
          loginResponse.data.includes('verification is required'))) {
        console.log("⚠️ Wordfence Login Security still requires additional verification.");
        console.log("Please check your Wordfence settings to disable additional verification.");
        
        // Ask if user wants to try manual cookie input
        const manualInput = await askQuestion("\nWould you like to manually input cookies from your browser? (yes/no): ");
        
        if (manualInput.toLowerCase() === 'yes') {
          return await manualCookieInput();
        }
      }
      
      return false;
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    }
    return false;
  }
}

// Function to test the WordPress REST API with cookies
async function testWordPressAPI() {
  if (!cookieJar.cookies.length) {
    console.log("No cookies available. Please log in first.");
    return false;
  }
  
  try {
    console.log("\nTesting WordPress REST API with cookies...");
    const response = await axios.get(`${WP_URL}/wp-json/wp/v2/posts`, {
      headers: {
        Cookie: cookieJar.getCookieString()
      }
    });
    
    if (response.status === 200) {
      console.log("✅ REST API is accessible!");
      console.log(`Found ${response.data.length} posts.`);
      return true;
    } else {
      console.log(`❌ REST API returned unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error("Error accessing REST API:", error.message);
    return false;
  }
}

// Function to create a post using the WordPress REST API with cookies
async function createPost(title, content, status = 'draft') {
  if (!cookieJar.cookies.length) {
    console.log("No cookies available. Please log in first.");
    return false;
  }
  
  try {
    console.log(`\nCreating a new ${status} post: "${title}"`);
    
    // Get the REST API nonce
    const nonceResponse = await axios.get(`${WP_URL}/wp-admin/admin-ajax.php?action=rest-nonce`, {
      headers: {
        Cookie: cookieJar.getCookieString()
      }
    });
    
    const nonce = nonceResponse.data;
    
    // Create the post
    const response = await axios.post(`${WP_URL}/wp-json/wp/v2/posts`, {
      title: title,
      content: content,
      status: status
    }, {
      headers: {
        Cookie: cookieJar.getCookieString(),
        'Content-Type': 'application/json',
        'X-WP-Nonce': nonce
      }
    });
    
    if (response.status === 201) {
      console.log("✅ Post created successfully!");
      console.log(`Post ID: ${response.data.id}`);
      console.log(`Post URL: ${response.data.link}`);
      return response.data;
    } else {
      console.log(`❌ Post creation returned unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error("Error creating post:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
    return false;
  }
}

// Main function
async function main() {
  // Log in to WordPress
  const loggedIn = await loginToWordPress();
  
  if (loggedIn) {
    // Test the WordPress REST API
    const apiWorks = await testWordPressAPI();
    
    if (apiWorks) {
      // Create a test post
      const testPost = await createPost(
        "Test Post from API",
        "This is a test post created using the WordPress REST API with cookie authentication.",
        "draft"
      );
      
      if (testPost) {
        console.log("\n✅ Everything is working correctly!");
        console.log("You can now use the cookie-based authentication in your main script.");
      }
    }
  }
}

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error("Unhandled error:", error);
  });
}

// Export functions for use in other scripts
module.exports = {
  loginToWordPress,
  cookieJar,
  loadCookies,
  saveCookies,
  createPost
}; 