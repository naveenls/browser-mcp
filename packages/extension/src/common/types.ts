export interface SessionDetails {
id: string;
name: string;
port: number;
}
  
export interface Session extends SessionDetails {
status: 'connected' | 'disconnected';
connection?: {
    ws: WebSocket;
    tabId: number;
};
}