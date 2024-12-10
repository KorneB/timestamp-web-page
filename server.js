const express = require('express');
const path = require('path');
const moment = require('moment');

const app = express();

// Enhanced debug logging
console.log('Starting server initialization...');
console.log('Current directory:', __dirname);
console.log('Views directory:', path.join(__dirname, 'views'));

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic route
app.get('/', (req, res) => {
    try {
        console.log('Rendering index page...');
        const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const weekday = moment().format('dddd');
        
        res.render('index', {
            current_time: currentTime,
            weekday: weekday,
            title: 'Timestamp POC'
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