import React, { useState } from 'react';
import GameCard from '../components/GameCard';
import GameViewer from '../components/GameViewer';
import games from '../data/games';
import './GamesPage.css'; // Import CSS file for styling

const GamesPage: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<string | null>(null);

    const handleGameClick = (gameId: string) => {
        setSelectedGame(gameId);
    };

    const handleCloseViewer = () => {
        setSelectedGame(null);
    };

    return (
        <div className="games-page">
            <h1>Playable browser games</h1>
            {!selectedGame ? (
                <div className="game-list">
                    {games.map((game) => (
                        <GameCard
                            key={game.id}
                            title={game.title}
                            description={game.description}
                            thumbnail={game.thumbnail}
                            onClick={() => handleGameClick(game.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="game-viewer-wrapper">
                    <GameViewer
                        gamePath={games.find((game) => game.id === selectedGame)!.path}
                        onClose={handleCloseViewer}
                    />
                </div>
            )}
        </div>
    );
};

export default GamesPage;
