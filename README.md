# Local Chat - Hono WebSocket Server

A simple Hono webserver with WebSocket support for chat functionality, written in TypeScript.

## Installation

```bash
npm install
```

## Building

To compile TypeScript to JavaScript:

```bash
npm run build
```

## Running

After building, run the compiled JavaScript:

```bash
npm start
```

Or for development with auto-reload (runs TypeScript directly with tsx):

```bash
npm run dev
```

## Usage

The server runs on `http://localhost:3000`

- **WebSocket endpoint**: `ws://localhost:3000/chat`
- **Health check**: `http://localhost:3000/`

## Testing WebSocket

You can test the WebSocket connection using:

1. Browser console:
```javascript
const ws = new WebSocket('ws://localhost:3000/chat');
ws.onmessage = (event) => console.log('Received:', event.data);
ws.send('Hello, server!');
```

2. Or use a WebSocket client tool like `wscat`:
```bash
npm install -g wscat
wscat -c ws://localhost:3000/chat
```

