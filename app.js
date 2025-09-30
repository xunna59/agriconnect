const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/apiRoutes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost', 'http://localhost:8080'];
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;  
