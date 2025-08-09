/**
 * Session-related types
 */

export interface Session {
  sessionId: string;
  name?: string;
  createdAt: number;
  tabId?: number;
  status: 'active' | 'inactive' | 'destroyed';
}

export interface SessionConnection {
  sessionId: string;
  tabId: number;
  connectedAt: number;
}