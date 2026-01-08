// server.js
const express = require('express');
const cors = require('cors');
const http = require('http');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { Server } = require("socket.io");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB setup - Lazy connection for Vercel serverless
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ayh9j9o.mongodb.net/?appName=Cluster0`;
let client = null;
let clientPromise = null;

let signalCollection;
let agentCollection;
let signalHistoryCollection;

// Lazy MongoDB connection - only connect when needed
const getMongoClient = async () => {
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
    });
    clientPromise = client.connect();
  }
  await clientPromise;
  return client;
};

// Initialize collections (lazy)
const initCollections = async () => {
  if (!signalCollection) {
    const mongoClient = await getMongoClient();
    const db = mongoClient.db('hackDay_bd');
    signalCollection = db.collection('signals');
    agentCollection = db.collection('agents');
    signalHistoryCollection = db.collection('signalHistory');

    // Create indexes for faster queries (only once)
    try {
      await agentCollection.createIndex({ deviceId: 1 }, { unique: true });
      await signalHistoryCollection.createIndex({ timestamp: -1 });
      await signalHistoryCollection.createIndex({ fromAgent: 1 });
      await signalHistoryCollection.createIndex({ toAgent: 1 });
    } catch (err) {
      // Indexes might already exist, ignore error
      console.log('Index creation skipped (may already exist)');
    }
  }
};

// Signal Code Library (predefined)
const SIGNAL_CODES = [
  { codeId: 'CMD_START', color: 'red', shape: 'triangle', motion: 'pulse', durationMs: 2000, meaning: 'Start mission', urgency: 'high' },
  { codeId: 'CMD_HOLD', color: 'blue', shape: 'square', motion: 'pulse', durationMs: 2000, meaning: 'Hold position', urgency: 'medium' },
  { codeId: 'CMD_ABORT', color: 'red', shape: 'circle', motion: 'flash', durationMs: 1000, meaning: 'Abort mission', urgency: 'critical' },
  { codeId: 'CMD_PROCEED', color: 'green', shape: 'triangle', motion: 'steady', durationMs: 3000, meaning: 'Proceed as planned', urgency: 'low' },
  { codeId: 'CMD_WAIT', color: 'yellow', shape: 'square', motion: 'pulse', durationMs: 1500, meaning: 'Wait for further instructions', urgency: 'medium' },
  { codeId: 'CMD_RETREAT', color: 'orange', shape: 'triangle', motion: 'flash', durationMs: 2000, meaning: 'Retreat immediately', urgency: 'high' },
  { codeId: 'CMD_SECURE', color: 'green', shape: 'square', motion: 'steady', durationMs: 2500, meaning: 'Area secure', urgency: 'low' },
  { codeId: 'CMD_DANGER', color: 'red', shape: 'diamond', motion: 'flash', durationMs: 1000, meaning: 'Danger detected', urgency: 'critical' },
  { codeId: 'CMD_ALL_CLEAR', color: 'green', shape: 'circle', motion: 'pulse', durationMs: 2000, meaning: 'All clear', urgency: 'low' },
  { codeId: 'CMD_STANDBY', color: 'blue', shape: 'square', motion: 'steady', durationMs: 3000, meaning: 'Standby for orders', urgency: 'low' }
];

// Commented out to prevent gateway timeout on Vercel
// MongoDB connection is now lazy-loaded when API endpoints are called
// async function run() {
//   try {
//     await client.connect();
//     const db = client.db('hackDay_bd');
//     signalCollection = db.collection('signals');
//     agentCollection = db.collection('agents');
//     signalHistoryCollection = db.collection('signalHistory');
//     await client.db("admin").command({ ping: 1 });
//     console.log("MongoDB connected successfully");
//   } catch (err) {
//     console.error(err);
//   }
// }
// run().catch(console.dir);

// Helper to get client IP
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         'unknown';
};

// Basic route
app.get('/', (req, res) => {
  res.send('Hack Day UIU Backend Running!');
});

// Get signal code library
app.get('/api/signal-codes', (req, res) => {
  res.json(SIGNAL_CODES);
});
