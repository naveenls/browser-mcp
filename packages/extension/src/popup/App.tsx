import  { useEffect, useState } from 'react';
import {} from '@chakra-ui/react';
import { Provider } from '@/components/ui/provider';
import { Session } from '@/common/types';

function AppContent() {
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        setCurrentTabId(tabs[0].id);
      }
    });
  }, []);

  const [sessions, setSessions] = useState<Session[]>([]);  
  const fetchSessions = () => {
    chrome.runtime.sendMessage(
      { action: 'getSessions' },
      (response) => setSessions(response.sessions)
    );
  };
  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  const [sessionProcessing, setSessionProcessing] = useState<string | null>(null);
  const handleConnect = async (sessionId: string) => {
    if (!currentTabId) {
      console.error('Could not determine the current tab ID');
      return;
    }

    setSessionProcessing(sessionId);
    chrome.runtime.sendMessage(
      {
        action: 'connectSession',
        sessionId,
        tabId: currentTabId,
      },
      (response) => {
        setSessionProcessing(null);
        if (response?.success) {
          console.log('Successfully connected to session');
        }
        // Refresh to show updated status
        fetchSessions();
      }
    );
  }

  const handleDisconnect = async (sessionId: string) => {
    setSessionProcessing(sessionId);
    chrome.runtime.sendMessage(
      {
        action: 'disconnectSession',
        sessionId,
      },
      (response) => {
        setSessionProcessing(null);
        if (response?.success) {
          console.log('Successfully disconnected from session');
        }
        // Refresh to show updated status
        fetchSessions();
      }
    );
  };

  const currentSession = sessions.find(
    s => s.status === 'connected' && s.connection?.tabId === currentTabId
  );

  return ()
}

export function App() {
  return (
    <Provider>
      <AppContent />
    </Provider>
  );
}