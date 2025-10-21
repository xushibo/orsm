#!/usr/bin/env node

/**
 * Mock server to simulate Cloudflare Worker functionality
 * This allows testing frontend-backend integration locally
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Mock AI responses
const mockResponses = [
  {
    word: "Apple",
    story: "A red apple sits on the table. The apple is sweet and crunchy, perfect for a healthy snack!"
  },
  {
    word: "Cat",
    story: "A fluffy cat plays with a ball of yarn. The cat is happy and purring softly."
  },
  {
    word: "Book",
    story: "A colorful book lies open on the desk. The book is full of wonderful stories to read."
  },
  {
    word: "Car",
    story: "A shiny red car drives down the street. The car goes vroom vroom and takes people places."
  },
  {
    word: "Dog",
    story: "A friendly dog wags its tail. The dog loves to play fetch and is a good friend."
  }
];

// POST endpoint to simulate Worker
app.post('/', upload.single('image'), (req, res) => {
  try {
    console.log('Received request:');
    console.log('- Method:', req.method);
    console.log('- Headers:', req.headers);
    console.log('- File:', req.file ? {
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    } : 'No file');

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Invalid file type. Please upload an image.' });
    }

    // Simulate processing delay
    const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
    
    setTimeout(() => {
      // Return random mock response
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      console.log('Sending response:', randomResponse);
      res.json(randomResponse);
    }, processingTime);

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoint: POST http://localhost:${PORT}/`);
  console.log(`🏥 Health check: GET http://localhost:${PORT}/health`);
  console.log('📝 This server simulates the Cloudflare Worker functionality');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down mock server...');
  process.exit(0);
});
