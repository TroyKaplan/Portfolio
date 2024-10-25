import React, { useState } from 'react';
import GameCard from '../components/GameCard';
import GameViewer from '../components/GameViewer';
import gamesData, { Game } from '../data/games';
import './GamesPage.css'; // Import CSS file for styling

const GamesPage: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [gamemakerExpanded, setGamemakerExpanded] = useState(true);
    const [xExpanded, setXExpanded] = useState(true);
    const [godotExpanded, setGodotExpanded] = useState(true);

    const handleGameClick = (gameId: string) => {
        setSelectedGame(gameId);
    };

    const handleCloseViewer = () => {
        setSelectedGame(null);
    };

    const toggleGamemakerSection = () => {
        setGamemakerExpanded(!gamemakerExpanded);
    };

    const toggleGodotSection = () => {
        setGodotExpanded(!godotExpanded);
    };

    const toggleXSection = () => {
        setXExpanded(!xExpanded);
    };

    const allGames = [...gamesData.gameMakerGames, ...gamesData.godotGames];
    const selectedGameData = allGames.find((game) => game.id === selectedGame);


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
                                {gamesData.gameMakerGames.map((game: Game) => (
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
                        <h2 onClick={toggleGodotSection} className="section-title">
                            Made With Godot {godotExpanded ? '▼' : '▶'}
                        </h2>
                        {godotExpanded && (
                            <div className="game-list">
                                {gamesData.godotGames.map((game: Game) => (
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
                </div>
            )}
        </div>
    );
};

export default GamesPage;
