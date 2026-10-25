const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server for WebRTC signaling
const wss = new WebSocket.Server({ server });

// Store connected clients for signaling
const clients = new Set();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket signaling for WebRTC
wss.on('connection', (ws, req) => {
  console.log('🔗 New WebSocket connection for signaling');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Broadcast to all other clients (simple mesh signaling)
      clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    console.log('🔌 WebSocket disconnected');
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    clients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`🎮 Oyun Atölyesi sunucusu http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`🎤 Sesli komut özelliği etkin`);
  console.log(`🔊 WebRTC sesli sohbet signaling aktif (ws://localhost:${PORT})`);
});