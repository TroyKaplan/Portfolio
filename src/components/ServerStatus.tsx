import React, { useState, useEffect } from 'react';
import './ServerStatus.css';

interface ServerStatusProps {
    serverType: 'wolfscape' | 'rocketGame';
}

const ServerStatus: React.FC<ServerStatusProps> = ({ serverType }) => {
    const [isOnline, setIsOnline] = useState<boolean>(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch('/api/game-status');
                const data = await response.json();
                setIsOnline(data[serverType]);
            } catch (error) {
                console.error('Failed to check server status:', error);
                setIsOnline(false);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 60000);

        return () => clearInterval(interval);
    }, [serverType]);

    return (
        <div className="server-status">
            Server Status: 
            <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
};

export default ServerStatus; 