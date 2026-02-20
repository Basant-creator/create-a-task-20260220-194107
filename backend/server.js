const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // This will also handle tasks

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Set security headers

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); // This route will handle user profile and tasks

// Basic route for health check
app.get('/', (req, res) => {
    res.json({ message: 'TaskMaster Pro API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));