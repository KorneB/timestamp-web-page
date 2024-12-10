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

- Node.js 18 or higher
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd timestamp-vmix-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the Node.js server:
   ```bash
   node server.js
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5051
   ```

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
   