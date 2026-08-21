import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connectSocket = () => {
      const token = localStorage.getItem('smarttable_token');
      
      const newSocket = io('/', {
        transports: ['websocket', 'polling'],
        auth: {
          token: token || null  // null = guest (public room access only)
        }
      });
      
      // Prevent infinite reconnect loop on auth errors
      newSocket.on('connect_error', (err) => {
        console.error('[Socket.io] Connection error:', err.message);
        if (err.message.includes('Authentication error') || err.message.includes('Forbidden')) {
          newSocket.disconnect();
        }
      });

      return newSocket;
    };

    let activeSocket = connectSocket();
    setSocket(activeSocket);

    const handleAuthChange = () => {
      console.log('[Socket.io] Auth state changed, reconnecting socket...');
      if (activeSocket) {
        activeSocket.disconnect();
      }
      activeSocket = connectSocket();
      setSocket(activeSocket);
    };

    window.addEventListener('auth-changed', handleAuthChange);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
