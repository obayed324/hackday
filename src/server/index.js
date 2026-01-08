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

// Agent registration endpoint (auto-register based on device fingerprint)
app.post('/api/agents/register', async (req, res) => {
  try {
    await initCollections(); // Lazy connection
    const { deviceId, codename } = req.body;
    const clientIP = getClientIP(req);
    
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID required' });
    }

    // Check if agent already exists
    let agent = await agentCollection.findOne({ deviceId });
    
    if (!agent) {
      // Create new agent
      const agentId = new ObjectId();
      agent = {
        agentId: agentId,
        codename: codename || `AGENT-${deviceId.substring(0, 8)}`,
        deviceId,
        deviceIP: clientIP,
        role: 'agent',
        status: 'active',
        createdAt: new Date(),
        lastSeen: new Date()
      };
      
      await agentCollection.insertOne(agent);
      console.log(`New agent registered: ${agent.codename} (${deviceId})`);
    } else {
      // Update last seen
      await agentCollection.updateOne(
        { deviceId },
        { $set: { lastSeen: new Date(), deviceIP: clientIP } }
      );
    }
    
    // Convert ObjectId to string for JSON response
    const agentResponse = {
      ...agent,
      agentId: agent.agentId.toString()
    };
    
    res.json({ agent: agentResponse });
  } catch (err) {
    console.error('Agent registration error:', err);
    res.status(500).json({ error: 'Failed to register agent' });
  }
});

// Get all agents
app.get('/api/agents', async (req, res) => {
  try {
    await initCollections(); // Lazy connection
    const agents = await agentCollection.find({ status: 'active' })
      .sort({ lastSeen: -1 })
      .toArray();
    // Convert ObjectIds to strings
    const agentsResponse = agents.map(agent => ({
      ...agent,
      agentId: agent.agentId.toString()
    }));
    res.json(agentsResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// REST API to get all signals (for SignalList initial load)
app.get('/api/signals', async (req, res) => {
  try {
    await initCollections(); // Lazy connection
    const signals = await signalHistoryCollection.find({})
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    res.json(signals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
});

// Get communication history for an agent
app.get('/api/agents/:agentId/history', async (req, res) => {
  try {
    await initCollections(); // Lazy connection
    const { agentId } = req.params;
    const history = await signalHistoryCollection.find({
      $or: [
        { fromAgent: agentId },
        { toAgent: agentId }
      ]
    })
    .sort({ timestamp: -1 })
    .limit(50)
    .toArray();
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "*" } // allow frontend connections
});

io.on("connection", (socket) => {
  console.log("Agent connected:", socket.id);

  // Listen for new signals
  socket.on("sendSignal", async (signal) => {
    try {
      await initCollections(); // Lazy connection
      const timestamp = new Date();
      
      // Find signal code meaning
      const signalCode = SIGNAL_CODES.find(code => code.codeId === signal.codeId);
      
      // Create signal history record
      const historyRecord = {
        fromAgent: signal.fromAgent,
        fromCodename: signal.fromCodename,
        toAgent: signal.toAgent || 'broadcast',
        toCodename: signal.toCodename || 'ALL',
        codeId: signal.codeId,
        color: signal.color,
        shape: signal.shape,
        motion: signal.motion,
        durationMs: signal.durationMs,
        meaning: signalCode?.meaning || 'Unknown signal',
        urgency: signalCode?.urgency || 'medium',
        deviceId: signal.deviceId,
        timestamp: timestamp,
        socketId: socket.id
      };

      // Save to signal history
      await signalHistoryCollection.insertOne(historyRecord);

      // Also save to legacy signals collection for backward compatibility
      await signalCollection.insertOne({
        message: signalCode?.meaning || signal.codeId,
        senderName: signal.fromCodename,
        senderId: signal.fromAgent,
        timestamp: timestamp.toISOString()
      });

      const signalPayload = {
        ...historyRecord,
        timestamp: timestamp.toISOString()
      };

      // If targeting specific agent, find their socket and emit
      // Otherwise broadcast to all
      if (signal.toAgent && signal.toAgent !== 'broadcast') {
        // For now, broadcast to all - in production, you'd maintain a socket-to-agent mapping
        socket.broadcast.emit("receiveSignal", signalPayload);
      } else {
        // Broadcast to all other clients
        socket.broadcast.emit("receiveSignal", signalPayload);
      }

      // Also emit back to sender for confirmation
      socket.emit("signalSent", signalPayload);

      console.log(`Signal sent: ${signal.fromCodename} -> ${signal.toCodename || 'ALL'}: ${signalCode?.meaning || signal.codeId}`);
    } catch (err) {
      console.error('Signal send error:', err);
      socket.emit("signalError", { error: 'Failed to send signal' });
    }
  });

  socket.on("disconnect", () => {
    console.log("Agent disconnected:", socket.id);
  });
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Covert Communication Server running on port ${port}`);
  console.log(`📡 Socket.io ready for agent connections`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${port} is already in use!`);
    console.error(`💡 Try: kill -9 $(lsof -ti:${port})`);
    console.error(`💡 Or change PORT in .env file`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});
