#!/usr/bin/env node

/**
 * Script to run the auto_post_wordpress.js with the healthcare prompt and template
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Running auto_post_wordpress.js with healthcare prompt and template...');

// Get the path to the auto_post_wordpress.js script
const scriptPath = path.join(__dirname, 'auto_post_wordpress.js');

// Run the script with the healthcare prompt option and template flag
const child = spawn('node', [
  scriptPath,
  '--use-healthcare-prompt',
  '--use-template',
  '--status', 'draft'
], {
  stdio: 'inherit'
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('Healthcare post script completed successfully!');
  } else {
    console.error(`Healthcare post script exited with code ${code}`);
  }
}); 