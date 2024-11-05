import React from 'react';
import './GameCard.css';
import ServerStatus from './ServerStatus';

interface GameCardProps {
    title: string;
    description: string;
    thumbnail: string;
    onClick: () => void;
    isMultiplayer?: boolean;
    serverType?: 'wolfscape' | 'rocketGame';
}

const GameCard: React.FC<GameCardProps> = ({ 
    title, 
    description, 
    thumbnail, 
    onClick,
    isMultiplayer,
    serverType 
}) => {
    return (
        <div className="game-card" onClick={onClick}>
            <div className="thumbnail-wrapper">
                <img src={thumbnail} alt={`${title} Thumbnail`} />
                <div className="play-button">
                    <span>&#x27A4;</span>
                </div>
            </div>
            <h3>{title}</h3>
            <div className="description-box">
                <div>
                    <p>{description}</p>
                    {isMultiplayer && serverType && (
                        <ServerStatus serverType={serverType} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameCard;
