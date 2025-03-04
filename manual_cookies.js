#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get WordPress URL from environment variables
let WP_URL = process.env.WP_URL;

// Fix the WordPress URL if needed
if (WP_URL && WP_URL.includes('/wp-admin')) {
  WP_URL = WP_URL.split('/wp-admin')[0];
}

// Remove trailing slash if present
if (WP_URL && WP_URL.endsWith('/')) {
  WP_URL = WP_URL.slice(0, -1);
}

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
function saveCookies(cookies) {
  const cookieFile = path.join(__dirname, '.wp_cookies.json');
  fs.writeFileSync(cookieFile, JSON.stringify(cookies));
  console.log(`Cookies saved to ${cookieFile}`);
}

// Main function
async function main() {
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
  
  const cookies = [];
  
  let cookieInput = "";
  while (cookieInput.toLowerCase() !== 'done') {
    cookieInput = await askQuestion("Enter cookie (name=value) or 'done' to finish: ");
    
    if (cookieInput.toLowerCase() !== 'done') {
      // Validate cookie format
      if (cookieInput.includes('=')) {
        cookies.push(cookieInput);
        console.log("Cookie added.");
      } else {
        console.log("Invalid cookie format. Please use 'name=value' format.");
      }
    }
  }
  
  if (cookies.length > 0) {
    saveCookies(cookies);
    console.log("\n✅ Cookies saved successfully!");
    console.log("You can now run your main script to post to WordPress.");
  } else {
    console.log("No cookies were added. Please try again.");
  }
}

// Run the main function
main().catch(error => {
  console.error("Unhandled error:", error);
}); 