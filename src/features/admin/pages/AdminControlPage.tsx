import React, { useEffect, useRef } from 'react';
import '../styles/AdminControlPage.css';

const AdminControlPage: React.FC = () => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket('wss://your-server-address');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      console.log('Received:', event.data);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendCommand = () => {
    ws.current?.send('TURN_ON_PC');
  };

  return (
    <div className="admin-control">
      <h1>ESP32 Control</h1>
      <button onClick={sendCommand}>Turn On PC</button>
    </div>
  );
};

export default AdminControlPage;

