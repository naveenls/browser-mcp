import { ExtensionSessionManager } from './session-manager';

console.log('Browser MCP Extension: Background service worker loaded');

const sessionManager = new ExtensionSessionManager();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {  
  switch (request.action) {
    case 'getSessions':
      const sessions = sessionManager.getSessions();
      sendResponse({ sessions });
      break;
      
    case 'connectSession':
      if (request.sessionId && request.tabId) {
        sessionManager.connectSession(request.sessionId, request.tabId)
          .then((success) => sendResponse({ success }))
          .catch((error) => sendResponse({ success: false, error: error.message }));
        return true;
      }
      break;
      
    case 'disconnectSession':
      if (request.sessionId) {
        sessionManager.disconnectSession(request.sessionId);
        sendResponse({ success: true });
      }
      break;
      
    case 'getSessionForTab':
      if (request.tabId) {
        const session = sessionManager.getSessionForTab(request.tabId);
        sendResponse({ session });
      }
      break;
      
    default:
      console.warn('Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
});

chrome.runtime.onSuspend.addListener(() => {
  console.log('Extension suspending, cleaning up...');
  sessionManager.stopScanning();
});

setInterval(() => {
  const sessions = sessionManager.getSessions();
  const connectedSessions = sessions.filter(s => s.status === 'connected');
  console.log(`Active sessions: ${sessions.length} total, ${connectedSessions.length} connected`);
}, 30000);