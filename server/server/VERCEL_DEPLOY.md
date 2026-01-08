# Vercel Deployment Guide

## Step 1: Complete Initial Deployment

When prompted "Would you like to pull environment variables now?", answer **"n"** (no).

We'll add them manually in the Vercel dashboard after deployment.

## Step 2: Add Environment Variables in Vercel Dashboard

After deployment completes, go to your Vercel project dashboard:

1. Go to: https://vercel.com/dashboard
2. Select your project: `server`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

### Required Environment Variables:

#### 1. MongoDB Credentials
- **Name**: `DB_USER`
- **Value**: Your MongoDB Atlas username
- **Environment**: Production, Preview, Development

- **Name**: `DB_PASS`
- **Value**: Your MongoDB Atlas password
- **Environment**: Production, Preview, Development

#### 2. Firebase Service Key (Optional - if using Firebase Admin)
- **Name**: `FB_SERVICE_KEY`
- **Value**: The base64 string (run `node convert-firebase-key.js` to get it)
- **Environment**: Production, Preview, Development

### How to Get Firebase Base64 Key:

```bash
cd server
node convert-firebase-key.js
```

Copy the base64 string and paste it as the value for `FB_SERVICE_KEY`.

## Step 3: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger automatic redeployment

## Step 4: Update Client API URL

Update your client's `.env` file:

```env
VITE_API_URL=https://your-vercel-url.vercel.app
```

Or set it in your client's Vercel environment variables if deploying client too.

## Important Notes:

- **PORT**: Vercel automatically sets `PORT`, you don't need to add it
- **Socket.io**: For Socket.io to work on Vercel, you may need to use Vercel's serverless functions with WebSocket support or consider using a different hosting for real-time features
- **MongoDB Connection**: Uses lazy loading to prevent gateway timeouts

## Troubleshooting:

- **Gateway Timeout**: MongoDB connection is now lazy-loaded to prevent this
- **Socket.io Issues**: Vercel serverless functions have limitations with WebSockets. Consider:
  - Using Vercel's Edge Functions
  - Using a separate service for Socket.io (like Railway, Render, or Fly.io)
  - Using Server-Sent Events (SSE) instead
