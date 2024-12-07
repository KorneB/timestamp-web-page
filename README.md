# Timestamp POC Web Application

A simple proof-of-concept web application that displays the current timestamp and last modification time of the application.

## Features

- Displays current server time
- Shows last modification time of the application
- Responsive design using Bootstrap
- Dark theme support

## Prerequisites

- Python 3.8 or higher
- Flask

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd timestamp-poc
   ```

2. Install dependencies:
   ```bash
   pip install flask
   ```

## Running the Application

1. Start the Flask server:
   ```bash
   python main.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5050
   ```

## Project Structure

- `main.py` - Flask application server
- `templates/` - HTML templates
  - `index.html` - Main page template
- `static/` - Static assets
  - `style.css` - Custom styles

## Development

The application runs in debug mode by default, which enables:
- Auto-reload on code changes
- Detailed error pages
- Debug logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
   