from flask import Flask, render_template
import datetime
import logging
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY") or "dev-key-timestamp"

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
    """Route for the main page displaying timestamps"""
    current_time = datetime.datetime.now()
    mod_time = get_file_modification_time()
    
    return render_template('index.html',
                         current_time=current_time,
                         mod_time=mod_time)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
