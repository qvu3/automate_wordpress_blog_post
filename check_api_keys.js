#!/usr/bin/env node

const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get API keys from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

async function checkOpenAIKey() {
  console.log("Checking OpenAI API key...");
  
  if (!OPENAI_API_KEY) {
    console.log("❌ OpenAI API key not found in .env file");
    return false;
  }
  
  try {
    const response = await axios.get('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });
    
    if (response.status === 200) {
      console.log("✅ OpenAI API key is valid");
      return true;
    } else {
      console.log(`❌ OpenAI API key check failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log("❌ OpenAI API key is invalid:", error.response?.data?.error?.message || error.message);
    return false;
  }
}

async function checkAnthropicKey() {
  console.log("Checking Anthropic/Claude API key...");
  
  if (!ANTHROPIC_API_KEY) {
    console.log("❌ Anthropic API key not found in .env file");
    return false;
  }
  
  try {
    const response = await axios.get('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      }
    });
    
    if (response.status === 200) {
      console.log("✅ Anthropic API key is valid");
      console.log("Available Claude models:");
      response.data.models.forEach(model => {
        console.log(`- ${model.id}`);
      });
      return true;
    } else {
      console.log(`❌ Anthropic API key check failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log("❌ Anthropic API key is invalid:", error.response?.data?.error?.message || error.message);
    return false;
  }
}

async function main() {
  console.log("API Key Checker");
  console.log("==============");
  
  const openaiValid = await checkOpenAIKey();
  console.log();
  const anthropicValid = await checkAnthropicKey();
  
  console.log("\nSummary:");
  console.log("========");
  console.log(`OpenAI API: ${openaiValid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`Anthropic API: ${anthropicValid ? '✅ Valid' : '❌ Invalid'}`);
  
  if (!openaiValid && !anthropicValid) {
    console.log("\n⚠️ No valid API keys found. Please check your .env file.");
  }
}

main().catch(error => {
  console.error("Error:", error);
}); 