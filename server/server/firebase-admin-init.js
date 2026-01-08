// Firebase Admin initialization using environment variable
// Use this when you need Firebase Admin SDK

// const serviceAccount = require("./firebase-admin-key.json"); // OLD WAY

// NEW WAY: Use service account from env variable (for Vercel deployment)
let admin = null;
let firebaseAdmin = null;

if (process.env.FB_SERVICE_KEY) {
  try {
    const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(decoded);
    
    // Initialize Firebase Admin
    admin = require('firebase-admin');
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin initialized from environment variable');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
} else {
  console.warn('FB_SERVICE_KEY not found in environment variables');
}

module.exports = { admin, firebaseAdmin };
