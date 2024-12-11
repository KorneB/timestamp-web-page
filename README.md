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
- Git (for cloning the repository)
  - Windows: Download from [git-scm.com](https://git-scm.com/)
  - Mac: Install with Homebrew `brew install git`
  - Linux: `sudo apt install git` or equivalent

### System Requirements
- Operating System: Windows 10/11, macOS 10.15+, or Linux
- Memory: 512MB RAM minimum
- Disk Space: 100MB free space
- Network: Internet connection for initial setup

### Port Requirements
The application uses the following ports:
- 5051: Main application server
- 8088: vMix API (only needed in Live mode)

Make sure these ports are available and not blocked by your firewall.

## Installation

### Step 1: Clone the Repository
```bash
# HTTPS clone (recommended)
git clone https://github.com/KorneB/vMix_testpage.git

# SSH clone (if configured)
git clone git@github.com:KorneB/vMix_testpage.git

cd vMix_testpage
```

### Step 2: Install Dependencies
```bash
# Install project dependencies
npm install

# Verify installation
npm list --depth=0
```

### Common Installation Issues

#### Missing Dependencies
If you see "Cannot find module" errors:
```bash
# Remove existing installations
rm -rf node_modules package-lock.json   # Mac/Linux
del /f /s /q node_modules package-lock.json   # Windows

# Reinstall dependencies
npm install
```

#### Permission Errors
For EACCES or permission errors:
- Windows: Run Command Prompt as Administrator
- Mac/Linux: Use `sudo npm install` or fix npm permissions:
  ```bash
  sudo chown -R $USER:$GROUP ~/.npm
  sudo chown -R $USER:$GROUP ~/.config
  ```

#### Network Issues
If npm install fails due to network:
```bash
# Clear npm cache
npm cache clean --force

# Try with different registry
npm install --registry=https://registry.npmjs.org/
```

## Running the Application

### Development Mode
```bash
# Start the server
node server.js

# The server will start on port 5051
# Access the application at http://localhost:5051
```

### Port Configuration
If port 5051 is in use:
1. Edit server.js and change the port number (line 108)
2. Or set PORT environment variable:
   ```bash
   # Windows (PowerShell)
   $env:PORT=3000; node server.js

   # Mac/Linux
   PORT=3000 node server.js
   ```

### Testing the Application

#### Demo Mode (Default)
- No vMix installation required
- Simulated inputs and connection status
- Perfect for interface testing

#### Live Mode
Requirements:
- vMix installed and running
- vMix API enabled (Settings → Web Controller)
- Port 8088 accessible

Steps:
1. Start vMix
2. Click "Demo Mode" button to switch to "Live Mode"
3. Check connection status indicator

### Troubleshooting Guide

#### Server Won't Start
1. Check Node.js installation:
   ```bash
   node --version  # Should be 18.x or higher
   ```
2. Verify all dependencies:
   ```bash
   npm list
   ```
3. Check port availability:
   ```bash
   # Windows (PowerShell)
   Get-NetTCPConnection -LocalPort 5051

   # Mac/Linux
   lsof -i :5051
   ```

#### Page Won't Load
1. Verify server running (check terminal)
2. Check firewall settings
3. Try different URLs:
   - http://localhost:5051
   - http://127.0.0.1:5051
   - http://[your-ip]:5051

#### vMix Connection Issues
1. Verify vMix running
2. Check vMix API settings
3. Test API directly: http://localhost:8088/api
4. Switch to Demo mode for testing

## Project Structure

```
vMix_testpage/
├── server.js          # Express application server
├── services/
│   └── vmixService.js # vMix API integration
├── views/
│   ├── index.ejs      # Main page template
│   └── error.ejs      # Error page template
├── public/
│   └── style.css      # Custom styles
└── package.json       # Project dependencies
```

## Development Features

### Core Features
- Real-time time display
- Dutch weekday translations
- vMix state management
- Live/Demo mode switching

### Technical Features
- Auto-reload capability
- Detailed error logging
- Debug mode
- Session management
- Bootstrap-based responsive UI

### vMix Integration

#### Demo Mode
- Simulated vMix inputs
- No vMix installation needed
- Perfect for development

#### Live Mode
- Real vMix API integration
- Connection monitoring
- Live input updates
- Raw API response viewing

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
   