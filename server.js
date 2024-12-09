const express = require('express');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');
const moment = require('moment');

const app = express();
const port = 5050;

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

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global state
let currentVmixIp = 'localhost:8088';
let demoMode = true;

// Helper functions
const getVmixApiUrl = (ip = null) => {
    const baseIp = ip || currentVmixIp;
    return `http://${baseIp}/api`;
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
        },
        {
            key: "3q4r5s6t-7u8v-9w0x-1y2z-3a4b5c6d7e8f",
            number: "3",
            name: "Video Clip",
            short_title: "VID",
            type: "Video",
            state: "Paused",
            position: "0",
            duration: "300",
            loop: "True",
            text_content: "Video Clip",
            selected: false,
            preview: false
        }
    ];
};

// vMix connection check
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
            // Verify if response is valid XML
            try {
                await xml2js.parseStringPromise(response.data);
                console.log(`Successfully connected to vMix at ${ip || currentVmixIp}`);
                return true;
            } catch (parseError) {
                console.error(`Invalid vMix API response format: ${parseError.message}`);
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

// Get vMix inputs
const getVmixInputs = async (ip = null) => {
    try {
        if (demoMode) {
            console.log("Demo mode: Returning sample vMix inputs");
            return { inputs: getDemoInputs(), rawResponse: "Demo mode - no raw response available" };
        }

        if (!await checkVmixConnection(ip)) {
            console.warn("Live mode: vMix not connected, returning empty input list");
            return { inputs: [], rawResponse: "Not connected to vMix" };
        }

        const apiUrl = getVmixApiUrl(ip);
        const response = await axios.get(apiUrl, { timeout: 2000 });
        
        if (response.status === 200) {
            const rawResponse = response.data;
            console.log("Raw vMix API response:", rawResponse);

            const result = await xml2js.parseStringPromise(response.data);
            const activeNumber = result.vmix?.active?.[0];
            const previewNumber = result.vmix?.preview?.[0];
            
            const inputs = result.vmix?.inputs?.[0]?.input?.map(input => ({
                key: input.$.key || '',
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
            })) || [];

            console.log(`Parsed ${inputs.length} inputs from vMix API`);
            return { inputs, rawResponse };
        }

        console.warn(`vMix API returned status code: ${response.status}`);
        return { inputs: [], rawResponse: `Error: Status ${response.status}` };
        
    } catch (error) {
        console.error(`Error fetching vMix inputs: ${error.message}`);
        return { inputs: [], rawResponse: `Error: ${error.message}` };
    }
};

// Routes
app.get('/', async (req, res) => {
    const currentTime = moment();
    const weekday = DUTCH_WEEKDAYS[currentTime.format('dddd')];
    
    const vmixConnected = demoMode || await checkVmixConnection();
    let vmixInputs = [];
    
    if (demoMode || vmixConnected) {
        const result = await getVmixInputs();
        vmixInputs = result.inputs;
    }
    
    res.render('index', {
        current_time: currentTime.format('YYYY-MM-DD HH:mm:ss'),
        weekday,
        vmix_connected: vmixConnected,
        vmix_inputs: vmixInputs,
        vmix_ip: currentVmixIp
    });
});

app.post('/toggle_mode', (req, res) => {
    try {
        demoMode = req.body.demo_mode;
        res.json({
            success: true,
            demo_mode: demoMode,
            message: `Switched to ${demoMode ? 'Demo' : 'Live'} mode`
        });
    } catch (error) {
        console.error(`Error toggling mode: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Failed to toggle mode'
        });
    }
});

app.post('/connect_vmix', async (req, res) => {
    try {
        let newIp = req.body.vmix_ip || 'localhost:8088';
        
        if (!newIp.includes(':')) {
            newIp = `${newIp}:8088`;
        }
        
        console.log(`Attempting to connect to vMix at ${newIp}`);
        const connected = await checkVmixConnection(newIp);
        
        if (connected) {
            currentVmixIp = newIp;
            const { inputs, rawResponse } = await getVmixInputs(newIp);
            console.log(`Successfully connected to vMix at ${newIp}`);
            
            res.json({
                connected: true,
                message: `Successfully connected to vMix at ${newIp}`,
                inputs,
                raw_response: rawResponse
            });
        } else {
            console.warn(`Failed to connect to vMix at ${newIp}`);
            res.json({
                connected: false,
                message: `Could not connect to vMix at ${newIp}. Please check if vMix is running and accessible.`,
                inputs: []
            });
        }
    } catch (error) {
        console.error(`Error connecting to vMix: ${error.message}`);
        res.status(500).json({
            connected: false,
            message: 'An error occurred while trying to connect to vMix.',
            inputs: []
        });
    }
});

function startServer(retryPort = port) {
    const server = app.listen(retryPort, '0.0.0.0')
        .on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`Port ${retryPort} is busy, trying ${retryPort + 1}...`);
                server.close();
                startServer(retryPort + 1);
            } else {
                console.error('Server error:', err);
            }
        })
        .on('listening', () => {
            const actualPort = server.address().port;
            console.log(`Server running at http://0.0.0.0:${actualPort}`);
        });
}

startServer();
