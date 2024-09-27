import React, { useState } from 'react';
import GameCard from '../components/GameCard';
import GameViewer from '../components/GameViewer';
import games from '../data/games';

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
            <h1>My Games</h1>
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
            {selectedGame && (
                <GameViewer
                    gamePath={games.find((game) => game.id === selectedGame)!.path}
                    onClose={handleCloseViewer}
                />
            )}
        </div>
    );
};

export default GamesPage;
