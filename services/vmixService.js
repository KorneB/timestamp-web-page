const axios = require('axios');
const xml2js = require('xml2js');

class VMixService {
    constructor() {
        this.isDemo = true;
        this.parser = new xml2js.Parser();
        this.baseUrl = 'http://172.30.3.1:8088/api';
    }

    async getConnectionStatus() {
        if (this.isDemo) {
            return { connected: true, mode: 'Demo' };
        }
        try {
            await axios.get(this.baseUrl);
            return { connected: true, mode: 'Live' };
        } catch (error) {
            return { connected: false, mode: 'Live' };
        }
    }

    async getInputs() {
        if (this.isDemo) {
            return [
                { number: 1, title: 'Demo Camera 1', type: 'Camera' },
                { number: 2, title: 'Demo Overlay', type: 'Image' },
                { number: 3, title: 'Demo Recording', type: 'Recording' }
            ];
        }

        try {
            const response = await axios.get(this.baseUrl);
            const result = await this.parser.parseStringPromise(response.data);
            return result.vmix.inputs[0].input.map(input => ({
                number: input.$.number,
                title: input.$.title,
                type: input.$.type
            }));
        } catch (error) {
            console.error('Error fetching vMix inputs:', error);
            return [];
        }
    }

    toggleMode() {
        this.isDemo = !this.isDemo;
        return { isDemo: this.isDemo };
    }

    async getRawApiResponse() {
        if (this.isDemo) {
            return JSON.stringify({
                demo: true,
                inputs: [
                    { number: 1, title: 'Demo Camera 1', type: 'Camera' },
                    { number: 2, title: 'Demo Overlay', type: 'Image' },
                    { number: 3, title: 'Demo Recording', type: 'Recording' }
                ]
            }, null, 2);
        }

        try {
            const response = await axios.get(this.baseUrl);
            return response.data;
        } catch (error) {
            return `Error fetching vMix API: ${error.message}`;
        }
    }
}

module.exports = new VMixService();
