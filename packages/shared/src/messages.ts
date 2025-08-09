/**
 * WebSocket message types for communication between MCP server and extension
 */

import type { ToolName, ToolInput, ToolOutput } from './tools.js';

// Message types
export const MESSAGE_TYPES = {
  // Connection management
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECTION_ACK: 'connection_ack',
  
  // Tool execution
  EXECUTE_TOOL: 'execute_tool',
  TOOL_RESULT: 'tool_result',
  
  // Error
  ERROR: 'error',
} as const;

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

export interface BaseMessage {
  type: MessageType;
  id: string; 
}

/**
 * Connection messages
 */
export interface ConnectMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.CONNECT;
  payload: { sessionId: string };
}

export interface DisconnectMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.DISCONNECT;
  payload: { sessionId: string };
}

export interface ConnectionAckMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.CONNECTION_ACK;
  payload: {
    sessionId: string;
    connected: boolean;
  };
}

/**
 * Tool execution messages
 */
export interface ExecuteToolMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.EXECUTE_TOOL;
  payload: {
    tool: ToolName;
    input: ToolInput;
  };
}

export interface ToolResultMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.TOOL_RESULT;
  payload: {
    tool: ToolName;
    output: ToolOutput;
  };
}
/**
 * Error message
 */
export interface ErrorMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.ERROR;
  payload: {
    error: string;
    code?: string;
    details?: any;
  };
}

/**
 * Union type for all messages
 */
export type Message = 
  | ConnectMessage
  | DisconnectMessage
  | ConnectionAckMessage
  | ExecuteToolMessage
  | ToolResultMessage
  | ErrorMessage;