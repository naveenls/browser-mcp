#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SessionManager } from './session-manager.js';

const sessionManager = new SessionManager();

const server = new Server(
  {
    name: 'browser-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

process.on('SIGINT', async () => {
  console.error('Shutting down...');
  await server.close();
  await sessionManager.close();
  process.exit(0);
});