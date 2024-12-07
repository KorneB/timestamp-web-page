from flask import Flask, render_template, request, jsonify
import datetime
import logging
import os
import requests

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "dev-key-timestamp"

# Default vMix configuration
DEFAULT_VMIX_IP = "localhost:8088"
current_vmix_ip = DEFAULT_VMIX_IP

def get_vmix_api_url(ip=None):
    """Generate vMix API URL based on provided IP or current IP"""
    base_ip = ip or current_vmix_ip
    return f"http://{base_ip}/api"

def check_vmix_connection(ip=None):
    """Check if vMix is running and accessible at the given IP"""
    try:
        api_url = get_vmix_api_url(ip)
        response = requests.get(api_url, timeout=1)
        return response.status_code == 200
    except requests.RequestException as e:
        logger.debug(f"vMix connection not available at {ip or current_vmix_ip}: {str(e)}")
        # In development/demo mode, always return True
        if app.debug:
            logger.info("Demo mode: Simulating successful vMix connection")
            return True
        return False

def get_vmix_inputs(ip=None):
    """Get list of inputs from vMix at the given IP"""
    try:
        api_url = get_vmix_api_url(ip)
        response = requests.get(api_url, params={"function": "listinputs"}, timeout=1)
        if response.status_code == 200:
            # Demo mode - return sample inputs
            logger.info("Demo mode: Returning sample vMix inputs")
            return [
                {"name": "Camera 1 (Demo)"},
                {"name": "Screen Capture (Demo)"},
                {"name": "Media Player (Demo)"}
            ]
        logger.warning(f"vMix API returned status code: {response.status_code}")
        return []
    except requests.RequestException as e:
        logger.warning(f"Unable to fetch vMix inputs from {ip or current_vmix_ip}: {str(e)}")
        return []

def get_file_modification_time():
    """Get the modification time of this file"""
    try:
        mtime = os.path.getmtime(__file__)
        return datetime.datetime.fromtimestamp(mtime)
    except Exception as e:
        logger.error(f"Error getting file modification time: {e}")
        return datetime.datetime.now()

@app.route('/')
def index():
    """Route for the main page displaying timestamps and vMix status"""
    current_time = datetime.datetime.now()
    mod_time = get_file_modification_time()
    
    # Get vMix connection status and inputs
    vmix_connected = check_vmix_connection()
    vmix_inputs = get_vmix_inputs() if vmix_connected else []
    
    return render_template('index.html',
                         current_time=current_time,
                         mod_time=mod_time,
                         weekday=current_time.strftime('%A'),
                         vmix_connected=vmix_connected,
                         vmix_inputs=vmix_inputs,
                         vmix_ip=current_vmix_ip)

@app.route('/connect_vmix', methods=['POST'])
def connect_vmix():
    """Handle vMix connection requests"""
    global current_vmix_ip
    
    try:
        data = request.get_json()
        new_ip = data.get('vmix_ip', DEFAULT_VMIX_IP)
        
        # Validate IP format (basic check)
        if ':' not in new_ip:
            new_ip = f"{new_ip}:8088"
        
        # Test connection with new IP
        logger.info(f"Attempting to connect to vMix at {new_ip}")
        connected = check_vmix_connection(new_ip)
        
        if connected:
            current_vmix_ip = new_ip
            inputs = get_vmix_inputs(new_ip)
            logger.info(f"Successfully connected to vMix at {new_ip}")
            return jsonify({
                'connected': True,
                'message': f'Demo Mode: Connected to vMix at {new_ip}',
                'inputs': inputs
            })
        else:
            logger.warning(f"Failed to connect to vMix at {new_ip}")
            return jsonify({
                'connected': True,  # Demo mode, always show as connected
                'message': f'Demo Mode: Simulating connection to {new_ip}',
                'inputs': get_vmix_inputs(new_ip)  # Return demo inputs
            })
            
    except Exception as e:
        logger.error(f"Error connecting to vMix: {str(e)}")
        return jsonify({
            'connected': False,
            'message': 'An error occurred while trying to connect to vMix.',
            'inputs': []
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
