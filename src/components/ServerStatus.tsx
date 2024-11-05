import React, { useState, useEffect } from 'react';
import './ServerStatus.css';

interface ServerStatusProps {
    serverType: 'wolfscape' | 'rocketGame';
}

const ServerStatus: React.FC<ServerStatusProps> = ({ serverType }) => {
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkStatus = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/game-status');
                const data = await response.json();
                setIsOnline(data[serverType]);
            } catch (error) {
                console.error('Failed to check server status:', error);
                setIsOnline(false);
            }
            setIsLoading(false);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [serverType]);

    return (
        <div className="server-status">
            {isLoading ? (
                <span className="status-indicator">Checking status...</span>
            ) : (
                <>
                    Server Status: 
                    <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                    </span>
                </>
            )}
        </div>
    );
};

export default ServerStatus; 