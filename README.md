# Timestamp & vMix Integration Web Application

A Node.js web application that displays current time, day of the week (with Dutch translations), and integrates with vMix for video production state management.

## Features

- Real-time time display with Dutch weekday translations
- vMix API integration
  - Live/Demo mode toggle
  - Input list display with detailed properties
  - Connection status monitoring
  - Raw API response viewing
- Dark theme with Bootstrap styling
- WebSocket-based real-time updates

## Prerequisites

### Required Software
- Node.js 18 or higher
  - Windows: Download from [nodejs.org](https://nodejs.org/)
  - Mac: Use Homebrew `brew install node`
  - Linux: Use package manager `sudo apt install nodejs npm` or equivalent
- npm (Node Package Manager, included with Node.js)
- Git

### Port Requirements
The application uses the following ports:
- 5051: Main application server
- 8088: vMix API (only needed in Live mode)

Make sure these ports are available and not blocked by your firewall.

## Installation

### Windows
1. Open Command Prompt or PowerShell and run:
   ```powershell
   git clone https://github.com/KorneB/vMix_testpage.git
   cd vMix_testpage
   npm install
   ```

### Mac/Linux
1. Open Terminal and run:
   ```bash
   git clone https://github.com/KorneB/vMix_testpage.git
   cd vMix_testpage
   npm install
   ```

### Common Installation Issues
- If you see "Cannot find module" errors when running the server:
  - This means dependencies aren't installed. Run `npm install` first
  - If the error persists, try removing node_modules and package-lock.json:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```
- If you see EACCES errors during npm install:
  - Windows: Run Command Prompt as Administrator
  - Mac/Linux: Use `sudo npm install`
- If port 5051 is in use:
  - Edit server.js and change the port number
  - Or stop the process using that port

## Running the Application

### Starting the Server
1. From your project directory, start the Node.js server:
   ```bash
   # Windows (Command Prompt/PowerShell)
   node server.js

   # Mac/Linux
   node server.js
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5051
   ```

### Testing the Application
1. The application starts in Demo mode by default
   - No vMix installation required
   - Simulated inputs and connection status
   - Perfect for testing the interface

2. To test with actual vMix (Live mode):
   - Make sure vMix is running on your machine
   - vMix API should be accessible at `http://localhost:8088`
   - Click the "Demo Mode" button to switch to "Live Mode"
   - The connection status will indicate if vMix is accessible

### Troubleshooting
- If the page doesn't load:
  - Verify the server is running (check terminal for errors)
  - Ensure port 5051 is not blocked by firewall
  - Try accessing via `http://127.0.0.1:5051`

- If vMix connection fails in Live mode:
  - Verify vMix is running
  - Check if vMix API is enabled in vMix settings
  - Ensure port 8088 is accessible
  - Switch back to Demo mode for testing

## Project Structure

- `server.js` - Express application server
- `views/` - EJS templates
  - `index.ejs` - Main page template
  - `error.ejs` - Error page template
- `public/` - Static assets
  - `style.css` - Custom styles

## Development

The application includes:
- Auto-reload capability
- Detailed error logging
- Debug mode
- Session management

## vMix Integration Features

### Demo Mode
- Simulated vMix inputs
- No actual vMix connection required
- Perfect for testing and development

### Live Mode
- Real vMix API integration
- Connection status monitoring
- Live input list updates
- Raw API response viewing

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
   