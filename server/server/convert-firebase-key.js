// Script to convert Firebase service account JSON to base64 string
// Run: node convert-firebase-key.js

const fs = require('fs');
const key = fs.readFileSync('./hackday_sdk.json', 'utf8');
const base64 = Buffer.from(key).toString('base64');
console.log('\n=== Firebase Service Key (Base64) ===');
console.log(base64);
console.log('\n=== Add this to your Vercel environment variables as FB_SERVICE_KEY ===\n');
