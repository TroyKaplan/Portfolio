import React, { useState, useEffect } from 'react';
import { FaExpand, FaCompress } from 'react-icons/fa';
import { DeviceInfo } from '../types/device';

interface FullscreenButtonProps {
    gameId: string;
    deviceInfo: DeviceInfo;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ gameId, deviceInfo }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleFullscreen = () => {
        const gameFrame = document.getElementById(`game-frame-${gameId}`) as HTMLIFrameElement;
        if (!gameFrame) return;

        if (!isFullscreen) {
            if (gameFrame.requestFullscreen) {
                gameFrame.requestFullscreen();
            }
            // Set resolution based on device
            gameFrame.style.width = `${deviceInfo.screenWidth}px`;
            gameFrame.style.height = `${deviceInfo.screenHeight}px`;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            // Reset to default size
            gameFrame.style.width = '100%';
            gameFrame.style.height = '600px';
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <button onClick={handleFullscreen} className="fullscreen-button">
            {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
    );
};

export default FullscreenButton; 