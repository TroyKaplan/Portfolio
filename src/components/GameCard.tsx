import React from 'react';
import './GameCard.css'; // Import CSS for styling

interface GameCardProps {
    title: string;
    description: string;
    thumbnail: string;
    onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, thumbnail, onClick }) => {
    return (
        <div className="game-card" onClick={onClick}>
            <div className="thumbnail-wrapper">
                <img src={thumbnail} alt={`${title} Thumbnail`} />
                <div className="play-button">
                    {/* You can use an icon or an SVG for the play arrow */}
                    <span>&#x27A4;</span> {/* Unicode character for play arrow */}
                </div>
            </div>
            <h3>{title}</h3>
            <div className="description-box">
                <p>{description}</p>
            </div>
        </div>
    );
};

export default GameCard;
