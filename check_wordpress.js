#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Get WordPress credentials from environment variables
let WP_URL = process.env.WP_URL;
const WP_USERNAME = process.env.WP_USERNAME;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

console.log("Loaded credentials:");
console.log(`WP_URL: ${WP_URL}`);
console.log(`WP_USERNAME: ${WP_USERNAME}`);
console.log(`WP_APP_PASSWORD: ${WP_APP_PASSWORD ? '******' + WP_APP_PASSWORD.slice(-4) : 'Not set'}`);

// Fix the WordPress URL if needed
if (WP_URL && WP_URL.includes('/wp-admin')) {
  WP_URL = WP_URL.split('/wp-admin')[0];
}

// Remove trailing slash if present
if (WP_URL && WP_URL.endsWith('/')) {
  WP_URL = WP_URL.slice(0, -1);
}

// Function to load cookies from a file
function loadCookies() {
  const cookieFile = path.join(__dirname, '.wp_cookies.json');
  if (fs.existsSync(cookieFile)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
      console.log(`Loaded cookies from ${cookieFile}`);
      return cookies;
    } catch (error) {
      console.error(`Error loading cookies: ${error.message}`);
      return [];
    }
  }
  return [];
}

async function checkWordPressConnection() {
  console.log("WordPress Connection Checker");
  console.log("==========================");
  
  // Check if WordPress URL is set
  if (!WP_URL) {
    console.log("❌ WordPress URL not found in .env file");
    console.log("Please add WP_URL=https://your-wordpress-site.com to your .env file");
    return false;
  }
  
  console.log(`Testing connection to: ${WP_URL}`);
  
  // Step 1: Check if the site is reachable
  try {
    console.log("\n1. Checking if site is reachable...");
    const siteResponse = await axios.get(WP_URL, { timeout: 10000 });
    console.log(`✅ Site is reachable (Status: ${siteResponse.status})`);
  } catch (error) {
    console.log(`❌ Site is not reachable: ${error.message}`);
    console.log("Please check that your WordPress site URL is correct and accessible");
    return false;
  }
  
  // Step 2: Check if REST API is available
  try {
    console.log("\n2. Checking if WordPress REST API is available...");
    const apiUrl = `${WP_URL}/wp-json`;
    const apiResponse = await axios.get(apiUrl, { timeout: 10000 });
    
    if (apiResponse.status === 200) {
      console.log("✅ WordPress REST API is available");
      
      // Check if we got a valid WordPress API response
      if (apiResponse.data && apiResponse.data.name) {
        console.log(`   Site name: ${apiResponse.data.name}`);
        console.log(`   WordPress version: ${apiResponse.data.namespaces.includes('wp/v2') ? 'v2 (compatible)' : 'unknown'}`);
      }
    } else {
      console.log(`❌ WordPress REST API returned unexpected status: ${apiResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ WordPress REST API is not available: ${error.message}`);
    console.log("Please check that:");
    console.log("1. The REST API is enabled on your WordPress site");
    console.log("2. There are no plugins blocking the REST API");
    return false;
  }
  
  // Step 3: Check if posts endpoint is available
  try {
    console.log("\n3. Checking if posts endpoint is available...");
    const postsUrl = `${WP_URL}/wp-json/wp/v2/posts`;
    const postsResponse = await axios.get(postsUrl, { timeout: 10000 });
    
    if (postsResponse.status === 200) {
      console.log("✅ Posts endpoint is available");
      console.log(`   Found ${postsResponse.data.length} posts`);
    } else {
      console.log(`❌ Posts endpoint returned unexpected status: ${postsResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Posts endpoint is not available: ${error.message}`);
    return false;
  }
  
  // Step 4: Check authentication with cookies
  const cookies = loadCookies();
  if (cookies.length > 0) {
    console.log("\n4. Checking authentication with saved cookies...");
    console.log(`   Found ${cookies.length} cookies`);
    
    try {
      const meUrl = `${WP_URL}/wp-json/wp/v2/users/me`;
      console.log(`   Testing authentication at: ${meUrl}`);
      
      const authResponse = await axios.get(meUrl, {
        headers: {
          'Cookie': cookies.join('; ')
        },
        timeout: 10000
      });
      
      if (authResponse.status === 200) {
        console.log("✅ Cookie authentication successful");
        console.log(`   Logged in as: ${authResponse.data.name} (${authResponse.data.slug})`);
        console.log(`   User role: ${authResponse.data.roles.join(', ')}`);
        
        // Check if user has permission to create posts
        if (authResponse.data.capabilities && (authResponse.data.capabilities.publish_posts || authResponse.data.capabilities.edit_posts)) {
          console.log("✅ User has permission to create/edit posts");
        } else {
          console.log("❌ User does not have permission to create/edit posts");
          console.log("   Please use an account with appropriate permissions");
        }
      } else {
        console.log(`❌ Authentication check returned unexpected status: ${authResponse.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Cookie authentication failed: ${error.message}`);
      
      if (error.response) {
        console.log(`   Status code: ${error.response.status}`);
        console.log(`   Response data:`, error.response.data);
        
        console.log("\nPossible cookie authentication issues:");
        console.log("1. Your cookies may have expired");
        console.log("2. The cookies may not have the necessary permissions");
        console.log("3. Wordfence may be blocking the API access");
        
        console.log("\nTry running the manual cookie input script again:");
        console.log("npm run manual-login");
      }
      
      // Fall back to Basic Auth if cookies fail
      if (WP_USERNAME && WP_APP_PASSWORD) {
        console.log("\nFalling back to Basic Authentication...");
        return await checkBasicAuth();
      }
      
      return false;
    }
  } else if (WP_USERNAME && WP_APP_PASSWORD) {
    console.log("\n4. No saved cookies found. Checking authentication with Basic Auth...");
    return await checkBasicAuth();
  } else {
    console.log("\n4. Skipping authentication check (no cookies or credentials provided)");
  }
  
  console.log("\nSummary:");
  console.log("========");
  console.log("✅ WordPress site is accessible");
  console.log("✅ WordPress REST API is available");
  console.log("✅ Posts endpoint is available");
  
  if (cookies.length > 0) {
    console.log("✅ Cookie authentication is working");
  } else if (WP_USERNAME && WP_APP_PASSWORD) {
    console.log("✅ Basic authentication is working");
  } else {
    console.log("⚠️ Authentication not checked (no cookies or credentials provided)");
  }
  
  console.log("\nYour WordPress configuration looks good!");
  return true;
}

// Function to check Basic Authentication
async function checkBasicAuth() {
  console.log(`   Username: ${WP_USERNAME}`);
  console.log(`   Password: ${WP_APP_PASSWORD ? '******' + WP_APP_PASSWORD.slice(-4) : 'Not set'}`);
  
  try {
    const meUrl = `${WP_URL}/wp-json/wp/v2/users/me`;
    console.log(`   Testing authentication at: ${meUrl}`);
    
    // Create Basic Auth token
    const token = Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');
    console.log(`   Using Basic Auth token: Basic ******`);
    
    const authResponse = await axios.get(meUrl, {
      headers: {
        'Authorization': `Basic ${token}`
      },
      timeout: 10000
    });
    
    if (authResponse.status === 200) {
      console.log("✅ Basic Authentication successful");
      console.log(`   Logged in as: ${authResponse.data.name} (${authResponse.data.slug})`);
      
      // Check if roles exists before trying to join
      if (authResponse.data.roles) {
        console.log(`   User role: ${authResponse.data.roles.join(', ')}`);
      } else {
        console.log(`   User role: Unknown (roles not provided in API response)`);
      }
      
      // Check if user has permission to create posts
      if (authResponse.data.capabilities && (authResponse.data.capabilities.publish_posts || authResponse.data.capabilities.edit_posts)) {
        console.log("✅ User has permission to create/edit posts");
      } else {
        console.log("❌ User does not have permission to create/edit posts");
        console.log("   Please use an account with appropriate permissions");
      }
      return true;
    } else {
      console.log(`❌ Authentication check returned unexpected status: ${authResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Basic Authentication failed: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status code: ${error.response.status}`);
      console.log(`   Response data:`, error.response.data);
      
      if (error.response.status === 401) {
        console.log("\nPossible authentication issues:");
        console.log("1. Check if your username is exactly correct (case sensitive)");
        console.log("2. Make sure your application password has no quotes or extra spaces in the .env file");
        console.log("3. Verify that your application password was correctly generated in WordPress");
        console.log("4. Try creating a new application password in WordPress");
        
        // Try with cookie-based authentication
        console.log("\nYour WordPress site might require cookie-based authentication.");
        console.log("Try running the manual cookie input script:");
        console.log("npm run manual-login");
      }
    }
    
    return false;
  }
}

checkWordPressConnection().catch(error => {
  console.error("Error:", error);
}); 