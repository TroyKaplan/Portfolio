import React, { useState } from 'react';
import GameCard from '../components/GameCard';
import GameViewer from '../components/GameViewer';
import games from '../data/games';
import './GamesPage.css'; // Import CSS file for styling

const GamesPage: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [gamemakerExpanded, setGamemakerExpanded] = useState(true);
    const [xExpanded, setXExpanded] = useState(true);

    const handleGameClick = (gameId: string) => {
        setSelectedGame(gameId);
    };

    const handleCloseViewer = () => {
        setSelectedGame(null);
    };

    const toggleGamemakerSection = () => {
        setGamemakerExpanded(!gamemakerExpanded);
    };

    const toggleXSection = () => {
        setXExpanded(!xExpanded);
    };

    const selectedGameData = games.find((game) => game.id === selectedGame);

    return (
        <div className="games-page">
            <h1 className="page-title">My Games and Projects</h1>
            {selectedGame ? (
                <div className="game-viewer-wrapper">
                    <GameViewer
                        gamePath={selectedGameData!.path}
                        instructions={selectedGameData!.instructions}
                        onClose={handleCloseViewer}
                    />
                </div>
            ) : (
                <div className="game-sections">
                    <div className="game-section">
                        <h2 onClick={toggleGamemakerSection} className="section-title">
                            Play in browser. No download required: Created with GameMaker {gamemakerExpanded ? '▼' : '▶'}
                        </h2>
                        {gamemakerExpanded && (
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
                        )}
                    </div>
                    <div className="game-section">
                        <h2 onClick={toggleXSection} className="section-title">
                            Made with Unreal Engine {xExpanded ? '▼' : '▶'}
                        </h2>
                        {xExpanded && (
                            <div className="game-list">
                                <p>No games available in this category yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GamesPage;
