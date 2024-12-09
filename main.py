from flask import Flask, render_template, request, jsonify
import datetime
import logging
import os
import requests
import xml.etree.ElementTree as ET

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "dev-key-timestamp"

# Default vMix configuration
DEFAULT_VMIX_IP = "localhost:8088"
current_vmix_ip = DEFAULT_VMIX_IP
demo_mode = True  # Default to demo mode for better initial experience
# Dutch weekday mapping
DUTCH_WEEKDAYS = {
    'Monday': 'maandag',
    'Tuesday': 'dinsdag',
    'Wednesday': 'woensdag',
    'Thursday': 'donderdag',
    'Friday': 'vrijdag',
    'Saturday': 'zaterdag',
    'Sunday': 'zondag'
}


def get_vmix_api_url(ip=None):
    """Generate vMix API URL based on provided IP or current IP"""
    base_ip = ip or current_vmix_ip
    return f"http://{base_ip}/api"

def check_vmix_connection(ip=None):
    """Check if vMix is running and accessible at the given IP"""
    if demo_mode:
        logger.info("Demo mode: Simulating successful vMix connection")
        return True

    # In live mode, attempt actual connection
    try:
        api_url = get_vmix_api_url(ip)
        logger.info(f"Live mode: Attempting to connect to vMix at {api_url}")
        
        response = requests.get(api_url, timeout=2)
        
        # Only consider connected if we get 200 status and valid XML
        if response.status_code == 200:
            try:
                ET.fromstring(response.content)
                logger.info(f"Successfully connected to vMix at {ip or current_vmix_ip}")
                return True
            except ET.ParseError as e:
                logger.error(f"Invalid vMix API response format: {str(e)}")
                return False
                
        logger.warning(f"vMix API returned unexpected status code: {response.status_code}")
        return False
        
    except ET.ParseError as e:
        logger.error(f"Invalid vMix API response format from {ip or current_vmix_ip}: {str(e)}")
        return False
    except requests.ConnectionError:
        logger.warning(f"Could not connect to vMix at {ip or current_vmix_ip}. Please check if vMix is running and accessible.")
        return False
    except requests.Timeout:
        logger.warning(f"Connection to vMix at {ip or current_vmix_ip} timed out.")
        return False
    except requests.RequestException as e:
        logger.error(f"vMix connection error at {ip or current_vmix_ip}: {str(e)}")
        return False

def get_demo_inputs():
    """Return sample vMix inputs for demo mode"""
    return [
        {
            "key": "5f5639f7-58ac-42f3-bf4f-44e20e6150fe",
            "number": "1",
            "name": "Camera 1",
            "short_title": "CAM1",
            "type": "Camera",
            "state": "Live",
            "position": "0",
            "duration": "0",
            "loop": "False",
            "text_content": "Camera 1",
            "selected": True,
            "preview": False
        },
        {
            "key": "7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p",
            "number": "2",
            "name": "PowerPoint Presentation",
            "short_title": "PPT",
            "type": "PowerPoint",
            "state": "Stopped",
            "position": "0",
            "duration": "0",
            "loop": "True",
            "text_content": "PowerPoint Presentation",
            "selected": False,
            "preview": True
        },
        {
            "key": "3q4r5s6t-7u8v-9w0x-1y2z-3a4b5c6d7e8f",
            "number": "3",
            "name": "Video Clip",
            "short_title": "VID",
            "type": "Video",
            "state": "Paused",
            "position": "0",
            "duration": "300",
            "loop": "True",
            "text_content": "Video Clip",
            "selected": False,
            "preview": False
        }
    ]

def get_vmix_inputs(ip=None):
    """Get list of inputs from vMix at the given IP"""
    try:
        # Return demo inputs in demo mode
        if demo_mode:
            logger.info("Demo mode: Returning sample vMix inputs")
            return get_demo_inputs(), "Demo mode - no raw response available"
            
        # In live mode, check connection first
        if not check_vmix_connection(ip):
            logger.warning("Live mode: vMix not connected, returning empty input list")
            return [], "Not connected to vMix"
            
        # Only proceed with API call if connection is verified
        api_url = get_vmix_api_url(ip)
        response = requests.get(api_url, timeout=2)
        
        raw_response = "Failed to get response"
        
        if response.status_code == 200:
            raw_response = response.text
            logger.debug(f"Raw vMix API response: {raw_response}")
            # Parse XML response
            root = ET.fromstring(response.content)
            inputs = []
            
            # Get active and preview input numbers from root level
            active_number = root.findtext('active')
            preview_number = root.findtext('preview')
            
            for input_elem in root.findall('.//input'):
                number = input_elem.get('number')
                input_data = {
                    "key": input_elem.get('key', ''),
                    "number": number,
                    "name": input_elem.get('title', 'Untitled'),
                    "short_title": input_elem.get('shortTitle', ''),
                    "type": input_elem.get('type', 'Unknown'),
                    "state": input_elem.get('state', ''),
                    "position": input_elem.get('position', '0'),
                    "duration": input_elem.get('duration', '0'),
                    "loop": input_elem.get('loop', 'False'),
                    "text_content": input_elem.text or '',
                    "selected": number == active_number,
                    "preview": number == preview_number
                }
                inputs.append(input_data)
                
            logger.debug(f"Parsed {len(inputs)} inputs from vMix API")
            return inputs, raw_response
            
        logger.warning(f"vMix API returned status code: {response.status_code}")
        return [], raw_response
    except ET.ParseError as e:
        error_msg = f"Failed to parse vMix XML response from {ip or current_vmix_ip}: {str(e)}"
        logger.error(error_msg)
        return [], error_msg
    except requests.RequestException as e:
        error_msg = f"Unable to fetch vMix inputs from {ip or current_vmix_ip}: {str(e)}"
        logger.error(error_msg)
        return [], error_msg

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
    
    # Handle connection status and inputs based on mode
    vmix_connected = check_vmix_connection() if not demo_mode else True
    vmix_inputs = []

    # Only get inputs if we're in demo mode or actually connected in live mode
    if demo_mode:
        vmix_inputs, _ = get_vmix_inputs()  # In demo mode, we don't need raw response
    elif vmix_connected:
        vmix_inputs, _ = get_vmix_inputs()  # We only need inputs for initial page load
    
    return render_template('index.html',
                         current_time=current_time,
                         mod_time=mod_time,
                         weekday=DUTCH_WEEKDAYS[current_time.strftime('%A')],
                         vmix_connected=vmix_connected,
                         vmix_inputs=vmix_inputs,
                         vmix_ip=current_vmix_ip)

@app.route('/toggle_mode', methods=['POST'])
def toggle_mode():
    """Toggle between demo and live mode"""
    global demo_mode
    try:
        data = request.get_json()
        demo_mode = data.get('demo_mode', False)
        
        return jsonify({
            'success': True,
            'demo_mode': demo_mode,
            'message': f'Switched to {"Demo" if demo_mode else "Live"} mode'
        })
    except Exception as e:
        logger.error(f"Error toggling mode: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to toggle mode'
        }), 500

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
            inputs, raw_response = get_vmix_inputs(new_ip)
            logger.info(f"Successfully connected to vMix at {new_ip}")
            response_data = {
                'connected': True,
                'message': f'Successfully connected to vMix at {new_ip}',
                'inputs': inputs,
                'raw_response': raw_response
            }
            return jsonify(response_data)
        else:
            logger.warning(f"Failed to connect to vMix at {new_ip}")
            response_data = {
                'connected': False,
                'message': f'Could not connect to vMix at {new_ip}. Please check if vMix is running and accessible.',
                'inputs': []
            }
            return jsonify(response_data)
            
    except Exception as e:
        logger.error(f"Error connecting to vMix: {str(e)}")
        response_data = {
            'connected': False,
            'message': 'An error occurred while trying to connect to vMix.',
            'inputs': []
        }
        return jsonify(response_data), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True, threaded=True)
