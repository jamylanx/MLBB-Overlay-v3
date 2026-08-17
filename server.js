const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware to parse JSON bodies
app.use(express.json());

// Objek untuk menyimpan data localStorage
let sharedStorage = {};

// Mengirim data ke semua klien yang terhubung
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', ws => {
  console.log('Client connected');
  // Kirim data localStorage saat ini ke klien yang baru terhubung
  ws.send(JSON.stringify({ type: 'init', data: sharedStorage }));

  ws.on('message', message => {
    try {
      const msg = JSON.parse(message);
      if (msg.type === 'update') {
        // Perbarui data sharedStorage, pastikan tidak ada data lama yang tersisa
        sharedStorage = { ...msg.data };
        console.log('Server updated sharedStorage:', sharedStorage);
        // Broadcast perubahan ke semua klien
        broadcast({ type: 'update', data: sharedStorage });
      } else if (msg.type === 'clear') {
        // Kosongkan sharedStorage sepenuhnya
        sharedStorage = {};
        console.log('Server cleared sharedStorage');
        // Broadcast pesan clear ke semua klien
        broadcast({ type: 'clear' });
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Serve file statis untuk testing
app.use(express.static('public'));

// Route to get JSON data
app.get('/api/postgame', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'public/database/postgame.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading JSON file:', error);
        res.status(500).json({ message: 'Error reading JSON file' });
    }
});

// Route to save JSON data
app.post('/api/postgame', async (req, res) => {
    try {
        await fs.writeFile(path.join(__dirname, 'public/database/postgame.json'), JSON.stringify(req.body, null, 2));
        res.json({ message: 'JSON file saved successfully' });
    } catch (error) {
        console.error('Error saving JSON file:', error);
        res.status(500).json({ message: 'Error saving JSON file' });
    }
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});