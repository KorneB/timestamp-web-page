const express = require('express');
const path = require('path');
const moment = require('moment');
const axios = require('axios');
const xml2js = require('xml2js');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set secret key
app.set('secret_key', process.env.SECRET_KEY || 'dev-key-timestamp');

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
    return {
        inputs: [
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
        ]
    };
};

const getVmixInputs = async (ip = null) => {
    try {
        if (demoMode) {
            console.log("Demo mode: Returning sample vMix inputs");
            return getDemoInputs();
        }

        if (!await checkVmixConnection(ip)) {
            console.warn("Live mode: vMix not connected");
            return { inputs: [], raw_response: "Not connected to vMix" };
        }

        const apiUrl = getVmixApiUrl(ip);
        const response = await axios.get(apiUrl, { timeout: 2000 });
        
        if (response.status === 200) {
            const result = await xml2js.parseStringPromise(response.data);
            const inputsData = result.vmix.inputs[0].input || [];
            
            const inputs = inputsData.map(input => ({
                key: input.$.key,
                number: input.$.number,
                name: input.$.title,
                short_title: input.$.shortTitle || '',
                type: input.$.type,
                state: input.$.state || '',
                position: input.$.position || '0',
                duration: input.$.duration || '0',
                loop: input.$.loop || 'False',
                text_content: input._ || '',
                selected: input.$.number === result.vmix.active[0],
                preview: input.$.number === result.vmix.preview[0]
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
        const currentTime = moment();
        const weekday = DUTCH_WEEKDAYS[currentTime.format('dddd')];
        
        const vmixConnected = demoMode || await checkVmixConnection();
        const { inputs: vmixInputs } = await getVmixInputs();
        
        res.render('index', {
            current_time: currentTime.format('YYYY-MM-DD HH:mm:ss'),
            weekday,
            vmix_connected: vmixConnected,
            vmix_inputs: vmixInputs,
            vmix_ip: currentVmixIp
        });
    } catch (error) {
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
        res.status(500).json({
            connected: false,
            message: `Error: ${error.message}`,
            inputs: []
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Something broke!',
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

// Start server
const startServer = (port = 5051) => {
    try {
        const server = app.listen(port, '0.0.0.0', () => {
            console.log(`Server running at http://0.0.0.0:${port}`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`Port ${port} is in use, trying ${port + 1}`);
                startServer(port + 1);
            } else {
                console.error('Server error:', error);
                process.exit(1);
            }
        });

        return server;
    } catch (error) {
        console.error('Fatal error starting server:', error);
        process.exit(1);
    }
};

startServer();