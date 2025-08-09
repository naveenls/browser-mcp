import { WebSocket, WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';
import { createServer as createHttpServer, Server } from 'http';
import * as net from 'net';
import * as shared from '@browser-mcp/shared';

interface SessionInfo {
  id: string;
  name: string;
  port: number;
}

interface TabConnection {
  tabId: number;
  ws: WebSocket;
}

export class SessionManager {
  private sessionId: string;
  private sessionName: string;
  private sessionPort: number | undefined;
  private httpServer: Server | undefined;
  private connection: TabConnection | undefined;

  constructor() {
    this.sessionId = randomUUID();
    this.sessionName = process.env.SESSION_NAME || 'untitled-session';
    this.connection = undefined;
    this.initPort();
  }

  async close() {
    // Close the WebSocket connection with the tab
    if (this.connection) {
      this.connection.ws.close();
    }
    this.sessionPort = undefined;
    this.httpServer?.close();
  }

  async initPort() {
    const availablePort = await this.findAvailablePort(8080);
    if (availablePort === undefined) {
      throw new Error('Failed to find available port');
    }

    const httpServer = createHttpServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
    
      if (req.method === 'GET' && req.url === '/session-info') {
        const sessionInfo = {
          id: this.sessionId,
          name: this.sessionName,
          port: availablePort,
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(sessionInfo));
        return;
      }
    
      res.writeHead(404);
      res.end('Not Found');
    });
    
    const wsServer = new WebSocketServer({ server: httpServer });
    
    httpServer.listen(availablePort, () => {
      console.error(`HTTP server listening on port ${availablePort}`);
    });

    wsServer.on('connection', (ws) => {
      console.error('WebSocket connection established');
  
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleWebSocketMessage(ws, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      });
    
      ws.on('close', () => {
        console.error('WebSocket connection closed');
        this.handleWebSocketDisconnect(ws);
      });
    
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    this.sessionPort = availablePort;
  }

  findAvailablePort(startPort: number): Promise<number> {
    return new Promise((resolve) => {
      function tryPort(port: number) {
        const server = net.createServer();
        server.unref();
        server.on('error', () => {
          tryPort(port + 1);
        });
        server.listen(port, () => {
          server.close(() => resolve(port));
        });
      }
      tryPort(startPort);
    });
  }

  handleWebSocketMessage(ws: WebSocket, message: shared.Message) {
    console.error('Received WebSocket message:', message.type);

    switch (message.type) {
      case shared.MESSAGE_TYPES.CONNECT:
        this.handleConnect(ws, message as shared.ConnectMessage);
        break;
      case shared.MESSAGE_TYPES.DISCONNECT:
        this.handleDisconnect(message as shared.DisconnectMessage);
        break;
      case shared.MESSAGE_TYPES.TOOL_RESULT:
        // TODO: Handle tool result
        break;
      case shared.MESSAGE_TYPES.ERROR:
        // TODO: Handle error
        break;
      default:
        console.error('Unknown message type:', message.type);
        this.sendError(ws, 'Unknown message type', message.id);
    }
  }

  handleWebSocketDisconnect(ws: WebSocket) {
    this.connection = undefined;
  }

  private handleConnect(ws: WebSocket, message: shared.ConnectMessage) {
    const { sessionId, tabId } = message.payload;    
    if (sessionId !== this.sessionId) {
      this.sendError(ws, 'Invalid session ID', message.id);
      return;
    }

    if (!tabId) {
      this.sendError(ws, 'Tab ID is required for connection', message.id);
      return;
    }

    // Store the connection
    this.connection = {
      tabId,
      ws,
    };
    console.info(`Tab ${tabId} connected to session ${this.sessionName}`);
    
    // Send confirmation
    const ackMessage: shared.ConnectionAckMessage = {
      type: shared.MESSAGE_TYPES.CONNECTION_ACK,
      id: message.id,
      payload: {
        sessionId: this.sessionId,
        connected: true,
      }
    };
    ws.send(JSON.stringify(ackMessage));
  }

  private handleDisconnect(message: shared.DisconnectMessage) {
    const { sessionId, tabId } = message.payload;
    
    if (sessionId !== this.sessionId || tabId !== this.connection?.tabId) {
      return;
    }

    this.connection = undefined;
    console.info(`Tab ${tabId} disconnected from session`);
  }

  private sendError(ws: WebSocket, error: string, messageId: string) {
    const errorMessage: shared.ErrorMessage = {
      type: shared.MESSAGE_TYPES.ERROR,
      id: messageId,
      timestamp: Date.now(),
      payload: {
        error,
      }
    };
    ws.send(JSON.stringify(errorMessage));
  }
}