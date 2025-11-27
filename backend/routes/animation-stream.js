import express from 'express';

const router = express.Router();

// Store active SSE connections
let clients = [];

/**
 * SSE endpoint - Frontend connects here to receive animation commands
 */
router.get('/stream', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Add client to list
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);

  console.log(`[SSE] Client ${clientId} connected. Total clients: ${clients.length}`);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

  // Remove client on disconnect
  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
    console.log(`[SSE] Client ${clientId} disconnected. Total clients: ${clients.length}`);
  });
});

/**
 * Broadcast animation command to all connected clients
 */
export function broadcastAnimation(command) {
  console.log(`[SSE] Broadcasting to ${clients.length} clients:`, command);
  
  const data = JSON.stringify(command);
  clients.forEach(client => {
    client.res.write(`data: ${data}\n\n`);
  });
}

/**
 * POST endpoint to trigger animations
 * This is what the LLM will call
 */
router.post('/trigger', (req, res) => {
  try {
    const command = req.body;
    
    if (!command || !command.type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Command must have a type' 
      });
    }

    // Broadcast to all connected frontends
    broadcastAnimation(command);

    res.json({ 
      success: true, 
      message: `Animation broadcasted to ${clients.length} client(s)`,
      command 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get number of connected clients
 */
router.get('/clients', (req, res) => {
  res.json({ 
    success: true, 
    count: clients.length 
  });
});

export default router;
