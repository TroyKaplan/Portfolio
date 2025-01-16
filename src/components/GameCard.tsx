import React, { useContext } from 'react';
import './GameCard.css';
import ServerStatus from './ServerStatus';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaPlay, FaTimes } from 'react-icons/fa';
import { trackGameClick } from '../services/api';

interface GameCardProps {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    onClick: () => void;
    access?: 'public' | 'subscriber';
    isMultiplayer?: boolean;
    serverType?: 'wolfscape' | 'rocketGame';
}

const GameCard: React.FC<GameCardProps> = ({ 
    id, 
    title, 
    description, 
    thumbnail, 
    onClick,
    access = 'public',
    isMultiplayer = false,
    serverType
}) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const canPlay =
        (access === 'public' && !isMultiplayer) ||
        (user && isMultiplayer) ||
        (user && access === 'subscriber' && (user.role === 'subscriber' || user.role === 'admin'));

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (canPlay) {
            try {
                await trackGameClick(id);
            } catch (error) {
                console.error('Failed to track game click:', error);
            }
            onClick();
        } else {
            if (access === 'subscriber') {
                navigate(user ? '/subscribe' : '/login?redirect=/subscribe');
            } else {
                navigate('/login');
            }
        }
    };

    return (
        <div className="game-card" onClick={handleClick} role="button" tabIndex={0}>
            <div className="thumbnail-wrapper">
                <img src={thumbnail} alt={`${title} Thumbnail`} />
                {isMultiplayer ? (
                    canPlay ? (
                        <div className="play-overlay">
                            <FaPlay size={48} color="#4CAF50" />
                        </div>
                    ) : (
                        <div className="lock-overlay">
                            <FaTimes size={48} color="red" />
                        </div>
                    )
                ) : (
                    access === 'subscriber' && !canPlay ? (
                        <div className="lock-overlay">
                            <FaLock size={48} />
                        </div>
                    ) : (
                        <div className="play-overlay">
                            <FaPlay size={48} color="#4CAF50" />
                        </div>
                    )
                )}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            {isMultiplayer && serverType && (
                <div className="server-status-container">
                    <ServerStatus serverType={serverType} />
                </div>
            )}
            {!canPlay && (
                <div className="subscription-notice">
                    {user ? 'Subscribe to Play' : 'Login to Play'}
                </div>
            )}
        </div>
    );
};

export default GameCard;
