from flask import Flask, render_template
import datetime
import logging
import os
import requests

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "dev-key-timestamp"

# vMix API Configuration
VMIX_API_URL = os.environ.get("VMIX_API_URL", "http://localhost:8088/api")

def check_vmix_connection():
    """Check if vMix is running and accessible"""
    try:
        response = requests.get(f"{VMIX_API_URL}", timeout=1)
        return response.status_code == 200
    except requests.RequestException:
        logger.debug("vMix connection not available")
        return False

def get_vmix_inputs():
    """Get list of inputs from vMix"""
    try:
        response = requests.get(f"{VMIX_API_URL}", params={"function": "listinputs"}, timeout=1)
        if response.status_code == 200:
            # For now, return a placeholder list since we can't connect to vMix
            # In production, this would parse the XML response from vMix
            logger.debug("Would parse vMix inputs here if connection was successful")
            return []
        logger.debug(f"vMix API returned status code: {response.status_code}")
        return []
    except requests.RequestException:
        logger.debug("Unable to fetch vMix inputs")
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
                         vmix_inputs=vmix_inputs)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
