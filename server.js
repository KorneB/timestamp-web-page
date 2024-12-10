const express = require('express');
const path = require('path');
const moment = require('moment');
const vmixService = require('./services/vmixService');

const app = express();

// Enhanced debug logging and error handling
console.log('Starting server initialization...');
console.log('Current directory:', __dirname);
console.log('Views directory:', path.join(__dirname, 'views'));
console.log('Environment:', process.env.NODE_ENV || 'development');

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// vMix API routes
app.get('/api/vmix/status', async (req, res) => {
    try {
        const status = await vmixService.getConnectionStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/vmix/inputs', async (req, res) => {
    try {
        const inputs = await vmixService.getInputs();
        res.json(inputs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/vmix/toggle-mode', (req, res) => {
    try {
        const result = vmixService.toggleMode();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/vmix/raw', async (req, res) => {
    try {
        const rawResponse = await vmixService.getRawApiResponse();
        res.send(rawResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Main route
app.get('/', async (req, res, next) => {
    try {
        console.log('Rendering index page...');
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const weekday = moment().format('dddd');
        const vmixStatus = await vmixService.getConnectionStatus();
        const vmixInputs = await vmixService.getInputs();
        
        res.render('index', {
            current_time: currentTime,
            weekday: weekday,
            vmixStatus,
            vmixInputs,
            title: 'Timestamp & vMix Integration'
        });
    } catch (error) {
        console.error('Error rendering index page:', error);
        next(error);
    }
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).render('error', {
        message: 'Page not found',
        error: { status: 404 }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).render('error', {
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start the server
const port = process.env.PORT || 5051;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});