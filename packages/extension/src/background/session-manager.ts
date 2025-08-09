import * as shared from '@browser-mcp/shared';


export class ExtensionSessionManager {
  private readonly scanStartPort = 8080;
  private readonly scanEndPort = 8100;
  private readonly scanIntervalMs = 10000; // 10 seconds

  private sessions: Map<string, Session> = new Map();
  private scanInterval: number | null = null;

  constructor() {
    this.startScanning();
  }

  private startScanning() {
    this.scanForSessions();
    
    this.scanInterval = setInterval(() => {
      this.scanForSessions();
    }, this.scanIntervalMs);
  }

  public stopScanning() {
    if (this.scanInterval !== null) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  private async scanForSessions() {
    console.log(`Scanning ports ${this.scanStartPort}-${this.scanEndPort} for MCP sessions...`);
    
    const newSessions = new Map<string, Session>();
    
    for (let port = this.scanStartPort; port <= this.scanEndPort; port++) {
        const sessionInfo = await this.checkPort(port);
        if (!sessionInfo) {
          continue;
        }
        if (this.sessions.has(sessionInfo.id)) {
          const existingSession = this.sessions.get(sessionInfo.id);
          const isConnected = existingSession?.connection?.ws.readyState === WebSocket.OPEN;
          
          if (isConnected) {
            newSessions.set(sessionInfo.id, existingSession);
            continue;
          };
        }

        newSessions.set(sessionInfo.id, {
          ...sessionInfo,
          status: 'disconnected',
        });
    }

    console.log(`Discovered ${newSessions.size} new sessions`);
    this.sessions = newSessions;
  }

  private async checkPort(port: number): Promise<{ id: string; name: string; port: number } | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
      
      const response = await fetch(`http://localhost:${port}/session-info`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      // Port not available or timeout
    }
    return null;
  }

  public async connectSession(sessionId: string, tabId: number): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.error(`Session ${sessionId} not found`);
      return false;
    }

    if (session.status === 'connected' && session.connection?.ws) {
      this.disconnectSession(sessionId);
    }

    try {
      const ws = new WebSocket(`ws://localhost:${session.port}`);
      
      return new Promise((resolve) => {
        ws.onopen = () => {
          const connectMessage: shared.ConnectMessage = {
            type: shared.MESSAGE_TYPES.CONNECT,
            id: crypto.randomUUID(),
            payload: { sessionId: session.id },
          };
          ws.send(JSON.stringify(connectMessage));
          
          session.connection = {
            ws,
            tabId,
          };
          session.status = 'connected';
          
          ws.onmessage = (event) => {
            this.handleWebSocketMessage(sessionId, event);
          };
          
          ws.onclose = () => {
            console.log(`WebSocket closed for session ${session.name}`);
            session.status = 'disconnected';
            session.connection = undefined;
          };
          
          ws.onerror = (error) => {
            console.error(`WebSocket error for session ${session.name}:`, error);
          };
          
          console.log(`Connected to session ${session.name} (${sessionId}) for tab ${tabId}`);
          resolve(true);
        };
        
        ws.onerror = (error) => {
          console.error(`Failed to connect to session ${session.name}:`, error);
          resolve(false);
        };
        
        // Timeout connection attempt
        setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            ws.close();
            resolve(false);
          }
        }, 5000);
      });
    } catch (error) {
      console.error(`Error connecting to session ${session.name}:`, error);
      return false;
    }
  }

  public disconnectSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session || session.status !== 'connected') {
      return;
    }
    if (!session.connection?.ws) {
      return;
    }

    const disconnectMessage: shared.DisconnectMessage = {
      type: shared.MESSAGE_TYPES.DISCONNECT,
      id: crypto.randomUUID(),
      payload: { sessionId: session.id },
    };
    
    try {
      session.connection.ws.send(JSON.stringify(disconnectMessage));
    } catch (error) {
      // Ignore send errors on disconnect
    }
    
    session.connection.ws.close();
    session.connection = undefined;
  }

  private handleWebSocketMessage(sessionId: string, event: MessageEvent) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    try {
      const message = JSON.parse(event.data) as shared.Message;
      console.log(`Received message from session ${session.name}:`, message.type);
      
      switch (message.type) {
        case shared.MESSAGE_TYPES.CONNECTION_ACK:
          const ackMessage = message as shared.ConnectionAckMessage;
          if (ackMessage.payload.connected) {
            console.log(`Connection acknowledged by session ${session.name}`);
          }
          break;
          
        case shared.MESSAGE_TYPES.TOOL_RESULT:
          // TODO: Implement when message handling is added
          break;
          
        case shared.MESSAGE_TYPES.ERROR:
          const errorMessage = message as shared.ErrorMessage;
          console.error(`Error from session ${session.name}:`, errorMessage.payload.error);
          break;
          
        default:
          console.log(`Unhandled message type from session ${session.name}:`, message.type);
      }
    } catch (error) {
      console.error(`Error parsing message from session ${session.name}:`, error);
    }
  }

  public getSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  public getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  public getSessionForTab(tabId: number): Session | undefined {
    for (const session of this.sessions.values()) {
      if (session.status === 'connected' && session.connection?.tabId === tabId) {
        return session;
      }
    }
    return undefined;
  }
}