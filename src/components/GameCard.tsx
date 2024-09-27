import React from 'react';

interface GameCardProps {
    title: string;
    description: string;
    thumbnail: string;
    onClick: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, thumbnail, onClick }) => {
    return (
        <div className="game-card" onClick={onClick}>
            <h3>{title}</h3>
            <img src={thumbnail} alt={`${title} Thumbnail`}/>
            <p>{description}</p>
        </div>
    );
};

export default GameCard;
