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
git clone https://github.com/KorneB/timestamp-web-page.git

# SSH clone (if configured)
git clone git@github.com:KorneB/timestamp-web-page.git

cd vMix_testpage
```

### Step 2: Install Dependencies (REQUIRED)
⚠️ **Important**: You must install dependencies before running the server!

```bash
# Navigate to project directory (if not already there)
cd timestamp-web-page

# Install project dependencies
npm install

# Verify installation
npm list --depth=0
```

If you see "Cannot find module" errors (e.g., 'express', 'ejs', etc.):
1. This means Node.js can't find required packages
2. Make sure you:
   - Are in the correct project directory
   - Have run `npm install` successfully
   - See a `node_modules` folder in your project directory
   - Have all dependencies listed in package.json

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

### Server Won't Start

##### Node.js Module Errors
If you see "Cannot find module" errors:
1. Check Node.js installation:
   ```bash
   node --version  # Should be 18.x or higher
   ```
2. Verify dependencies installation:
   ```bash
   # Check if node_modules exists
   ls node_modules  # Mac/Linux
   dir node_modules # Windows

   # If missing or empty, reinstall:
   npm install

   # Verify all dependencies:
   npm list
   ```
3. If problems persist:
   ```bash
   # Remove node_modules and package-lock
   rm -rf node_modules package-lock.json   # Mac/Linux
   rd /s /q node_modules & del package-lock.json  # Windows

   # Clear npm cache
   npm cache clean --force

   # Reinstall everything
   npm install
   ```

##### Port Already in Use
1. Check port availability:
   ```bash
   # Windows (PowerShell)
   Get-NetTCPConnection -LocalPort 5051

   # Mac/Linux
   lsof -i :5051
   ```
2. If port is in use:
   - Kill the existing process
   - Or use a different port:
     ```bash
     # Windows
     set PORT=3000 && node server.js
     
     # Mac/Linux
     PORT=3000 node server.js
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

##### Node.js Module Errors
If you see "Cannot find module" errors:
1. Check Node.js installation:
   ```bash
   node --version  # Should be 18.x or higher
   ```
2. Verify dependencies installation:
   ```bash
   # Check if node_modules exists
   ls node_modules  # Mac/Linux
   dir node_modules # Windows

   # If missing or empty, reinstall:
   npm install

   # Verify all dependencies:
   npm list
   ```
3. If problems persist:
   ```bash
   # Remove node_modules and package-lock
   rm -rf node_modules package-lock.json   # Mac/Linux
   rd /s /q node_modules & del package-lock.json  # Windows

   # Clear npm cache
   npm cache clean --force

   # Reinstall everything
   npm install
   ```

##### Port Already in Use
1. Check port availability:
   ```bash
   # Windows (PowerShell)
   Get-NetTCPConnection -LocalPort 5051

   # Mac/Linux
   lsof -i :5051
   ```
2. If port is in use:
   - Kill the existing process
   - Or use a different port:
     ```bash
     # Windows
     set PORT=3000 && node server.js
     
     # Mac/Linux
     PORT=3000 node server.js
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
timestamp-web-page/
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
   

## Development Workflow

### Getting Started with Development

1. Start the development server:
```bash
node server.js
```

2. Access the development site:
- Main URL: http://localhost:5051
- The server will automatically reload when you make changes

### Debugging Tips

#### Server-side Debugging
1. Check the console output for detailed logs
2. Server logs include:
   - Connection status
   - API responses
   - Error messages
   - Performance metrics

#### Client-side Debugging
1. Use browser developer tools (F12)
2. Check the Console tab for:
   - JavaScript errors
   - Network requests
   - API responses

### Testing Your Changes

1. Manual Testing Steps:
   - Verify time display updates
   - Test vMix connection in both Demo and Live modes
   - Confirm proper error handling
   - Check responsive design on different screen sizes

2. API Testing:
   ```bash
   # Test vMix API status
   curl http://localhost:5051/api/vmix/status

   # Get input list
   curl http://localhost:5051/api/vmix/inputs

   # Get raw API response
   curl http://localhost:5051/api/vmix/raw
   ```

### Common Development Scenarios

#### Adding New Features
1. Create new routes in server.js
2. Add corresponding views in /views
3. Update services/vmixService.js for vMix-related features
4. Add necessary styling in public/style.css

#### Modifying Existing Features
1. Locate relevant files using the project structure
2. Make changes incrementally
3. Test in Demo mode first
4. Verify in Live mode if applicable

#### Handling vMix Integration
1. Start in Demo mode for initial development
2. Test with local vMix installation
3. Verify different connection scenarios
4. Handle errors appropriately

### Code Style Guidelines

1. JavaScript
   - Use ES6+ features
   - Maintain async/await pattern
   - Handle errors properly
   - Use meaningful variable names

2. HTML/EJS
   - Follow semantic HTML5 standards
   - Use Bootstrap classes consistently
   - Keep templates modular
   - Comment complex sections

3. CSS
   - Use Bootstrap utilities when possible
   - Minimize custom CSS
   - Follow BEM naming convention for custom classes
   - Maintain dark theme consistency

### Version Control

1. Commit Guidelines
   - Write clear commit messages
   - Keep commits focused and atomic
   - Reference issues when applicable

2. Branch Strategy
   - main: stable releases
   - develop: ongoing development
   - feature/*: new features
   - fix/*: bug fixes

### Environment Configuration

#### Development Settings
1. Server Configuration
   - Default port: 5051 (configurable via PORT environment variable)
   - Debug mode: enabled by default
   - vMix demo mode: enabled by default for development without vMix installation

2. Environment Variables
   ```bash
   # Required for production
   NODE_ENV=development    # or 'production' for production mode
   PORT=5051              # Optional, defaults to 5051
   ```

#### vMix Configuration
1. Demo Mode (Default)
   - No configuration needed
   - Perfect for development and testing
   - Simulated vMix inputs and states

2. Live Mode
   - vMix Installation
     - Download from [vMix website](https://www.vmix.com/download/)
     - Install and run vMix
   - API Configuration
     - Enable Web Controller in vMix settings
     - Default API endpoint: http://localhost:8088/api
     - Ensure port 8088 is accessible

3. Testing vMix Integration
   ```bash
   # Test vMix API connection
   curl http://localhost:8088/api
   
   # If successful, you should see XML response
   # If failed, verify vMix is running and Web Controller is enabled
   ```

#### Production Settings
1. Environment Setup
   ```bash
   # Required environment variables
   NODE_ENV=production
   PORT=5051              # Or your preferred port
   ```

2. Server Configuration
   - Debug logging: disabled
   - Error handling: production mode (no stack traces)
   - Process management: Consider using PM2 or similar

3. Security Considerations
   - Set appropriate firewall rules
   - Configure SSL/TLS if exposed to internet
   - Implement rate limiting if needed

Remember to:
- Always test in Demo mode first
- Verify vMix connectivity before switching to Live mode
- Test all features thoroughly before deployment
- Keep environment variables secure
- Monitor server logs for issues