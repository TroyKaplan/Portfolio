import React, { useState, useEffect, useCallback } from 'react';
import '../styles/ServerStatus.css';

interface ServerStatusProps {
    serverType: 'wolfscape' | 'rocketGame';
}

interface StatusResponse {
    wolfscape: boolean;
    rocketGame: boolean;
    error?: string;
    warning?: string;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ serverType }) => {
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [consecutiveFailures, setConsecutiveFailures] = useState(0);

    const checkStatus = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

            const response = await fetch('/api/game-status', {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: StatusResponse = await response.json();
            
            if (data && typeof data[serverType] === 'boolean') {
                // Only set offline after 3 consecutive failures
                if (!data[serverType]) {
                    setConsecutiveFailures(prev => prev + 1);
                    if (consecutiveFailures >= 2) {
                        setIsOnline(false);
                    }
                } else {
                    setConsecutiveFailures(0);
                    setIsOnline(true);
                }
            }
        } catch (error) {
            // Don't change status on timeout unless we've had multiple failures
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.log('Request timed out');
                    setConsecutiveFailures(prev => prev + 1);
                    if (consecutiveFailures >= 2) {
                        setIsOnline(false);
                    }
                } else {
                    console.error('Failed to check server status:', error);
                    setConsecutiveFailures(prev => prev + 1);
                    if (consecutiveFailures >= 2) {
                        setIsOnline(false);
                    }
                }
            }
        }
    }, [serverType, consecutiveFailures]);

    useEffect(() => {
        // Initial check
        checkStatus();

        // Check every 2 minutes
        const interval = setInterval(checkStatus, 120000); // 120000ms = 2 minutes

        // Cleanup
        return () => {
            clearInterval(interval);
        };
    }, [checkStatus]);

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

