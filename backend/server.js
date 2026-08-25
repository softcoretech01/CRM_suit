require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./config/db');

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Techspire CRM Backend API' });
});

// We will map our database connection testing here later
app.get('/api/health', async (req, res) => {
    try {
      await db.mastersDb.authenticate();
      res.json({ status: 'ok', databases: 'connected' });
    } catch (e) {
      res.json({ status: 'error', databases: 'disconnected', error: e.message });
    }
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}.`);
  await db.testConnections();
});
