const express = require('express');
const path = require('path');
const moment = require('moment');
const axios = require('axios');
const xml2js = require('xml2js');
const util = require('util');
const parseString = util.promisify(xml2js.parseString);

const app = express();

// Debug logging for startup
console.log('Starting server initialization...');
console.log('Current directory:', __dirname);
console.log('Available views:', path.join(__dirname, 'views'));

// Configure logging
const logRequest = (req, res, next) => {
    console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} - ${req.method} ${req.url}`);
    next();
};

// Basic error handler
const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);
    res.status(500).json({ error: err.message });
};

// Middleware setup
app.use(logRequest);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
const session = require('express-session');
app.use(session({
    secret: process.env.SECRET_KEY || 'dev-key-timestamp',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Trust proxy for accurate client IP behind reverse proxy
app.set('trust proxy', true);

// Global state
let currentVmixIp = 'localhost:8088';
let demoMode = true;  // Default to demo mode

// Dutch weekday mapping
const DUTCH_WEEKDAYS = {
    'Monday': 'maandag',
    'Tuesday': 'dinsdag',
    'Wednesday': 'woensdag',
    'Thursday': 'donderdag',
    'Friday': 'vrijdag',
    'Saturday': 'zaterdag',
    'Sunday': 'zondag'
};

// vMix API helpers
const getVmixApiUrl = (ip = null) => {
    const baseIp = ip || currentVmixIp;
    return `http://${baseIp}/api`;
};

const checkVmixConnection = async (ip = null) => {
    if (demoMode) {
        console.log("Demo mode: Simulating successful vMix connection");
        return true;
    }

    try {
        const apiUrl = getVmixApiUrl(ip);
        console.log(`Live mode: Attempting to connect to vMix at ${apiUrl}`);
        
        const response = await axios.get(apiUrl, { timeout: 2000 });
        
        if (response.status === 200) {
            try {
                await xml2js.parseStringPromise(response.data);
                console.log(`Successfully connected to vMix at ${ip || currentVmixIp}`);
                return true;
            } catch (e) {
                console.error(`Invalid vMix API response format: ${e.message}`);
                return false;
            }
        }
        
        console.warn(`vMix API returned unexpected status code: ${response.status}`);
        return false;
    } catch (error) {
        console.error(`vMix connection error at ${ip || currentVmixIp}: ${error.message}`);
        return false;
    }
};

const getDemoInputs = () => {
    return [
        {
            key: "5f5639f7-58ac-42f3-bf4f-44e20e6150fe",
            number: "1",
            name: "Camera 1",
            short_title: "CAM1",
            type: "Camera",
            state: "Live",
            position: "0",
            duration: "0",
            loop: "False",
            text_content: "Camera 1",
            selected: true,
            preview: false
        },
        {
            key: "7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p",
            number: "2",
            name: "PowerPoint Presentation",
            short_title: "PPT",
            type: "PowerPoint",
            state: "Stopped",
            position: "0",
            duration: "0",
            loop: "True",
            text_content: "PowerPoint Presentation",
            selected: false,
            preview: true
        }
    ];
};

const getVmixInputs = async (ip = null) => {
    try {
        if (demoMode) {
            console.log("Demo mode: Returning sample vMix inputs");
            return { inputs: getDemoInputs(), raw_response: "Demo mode - no raw response available" };
        }

        if (!await checkVmixConnection(ip)) {
            console.warn("Live mode: vMix not connected");
            return { inputs: [], raw_response: "Not connected to vMix" };
        }

        const apiUrl = getVmixApiUrl(ip);
        const response = await axios.get(apiUrl, { timeout: 2000 });
        
        if (response.status === 200) {
            const result = await xml2js.parseStringPromise(response.data);
            const vmixData = result.vmix;
            const inputsData = vmixData.inputs?.[0]?.input || [];
            const activeNumber = vmixData.active?.[0];
            const previewNumber = vmixData.preview?.[0];
            
            const inputs = inputsData.map(input => ({
                key: input.$.key,
                number: input.$.number,
                name: input.$.title || 'Untitled',
                short_title: input.$.shortTitle || '',
                type: input.$.type || 'Unknown',
                state: input.$.state || '',
                position: input.$.position || '0',
                duration: input.$.duration || '0',
                loop: input.$.loop || 'False',
                text_content: input._ || '',
                selected: input.$.number === activeNumber,
                preview: input.$.number === previewNumber
            }));

            return { inputs, raw_response: response.data };
        }

        return { inputs: [], raw_response: `Error: Status ${response.status}` };
    } catch (error) {
        console.error('Error fetching vMix inputs:', error);
        return { inputs: [], raw_response: error.message };
    }
};

// Routes
app.get('/', async (req, res, next) => {
    try {
        // Get current time and weekday
        const currentTime = moment();
        const weekday = DUTCH_WEEKDAYS[currentTime.format('dddd')];
        
        // Check vMix connection status based on mode
        let vmixConnected = false;
        let vmixInputs = [];
        
        if (demoMode) {
            vmixConnected = true;
            ({ inputs: vmixInputs } = await getVmixInputs());
        } else {
            vmixConnected = await checkVmixConnection();
            if (vmixConnected) {
                ({ inputs: vmixInputs } = await getVmixInputs());
            }
        }
        
        res.render('index', {
            current_time: currentTime.format('YYYY-MM-DD HH:mm:ss'),
            weekday,
            vmix_connected: vmixConnected,
            vmix_inputs: vmixInputs,
            vmix_ip: currentVmixIp
        });
    } catch (error) {
        console.error('Error in index route:', error);
        next(error);
    }
});

app.post('/toggle_mode', (req, res) => {
    try {
        const { demo_mode } = req.body;
        demoMode = demo_mode;
        
        res.json({
            success: true,
            demo_mode: demoMode,
            message: `Switched to ${demoMode ? 'Demo' : 'Live'} mode`
        });
    } catch (error) {
        console.error('Error toggling mode:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle mode'
        });
    }
});

app.post('/connect_vmix', async (req, res) => {
    try {
        const { vmix_ip } = req.body;
        let newIp = vmix_ip;
        
        if (!newIp.includes(':')) {
            newIp = `${newIp}:8088`;
        }
        
        const connected = await checkVmixConnection(newIp);
        
        if (connected) {
            currentVmixIp = newIp;
            const { inputs, raw_response } = await getVmixInputs(newIp);
            
            res.json({
                connected: true,
                message: `Successfully connected to vMix at ${newIp}`,
                inputs,
                raw_response
            });
        } else {
            res.json({
                connected: false,
                message: `Could not connect to vMix at ${newIp}`,
                inputs: []
            });
        }
    } catch (error) {
        console.error('Error connecting to vMix:', error);
        res.status(500).json({
            connected: false,
            message: `Error: ${error.message}`,
            inputs: []
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).render('error', {
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page not found',
        error: {}
    });
});

// Start the server
const port = process.env.PORT || 5051;

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please try a different port.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing server.');
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
});
