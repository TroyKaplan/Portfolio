import React, { useState } from 'react';
import GameCard from '../components/GameCard';
import GameViewer from '../components/GameViewer';
import gamesData, { Game } from '../data/games';
import './GamesPage.css'; // Import CSS file for styling

const GamesPage: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [gamemakerExpanded, setGamemakerExpanded] = useState(true);
    const [godotExpanded, setGodotExpanded] = useState(true);
    const [multiplayerExpanded, setMultiplayerExpanded] = useState(true);

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

    const toggleMultiplayerSection = () => {
        setMultiplayerExpanded(!multiplayerExpanded);
    };

    // Include all game types in the allGames array
    const allGames = [
        ...gamesData.gameMakerGames,
        ...gamesData.godotGames,
        ...gamesData.multiplayerGames
    ];
    
    const selectedGameData = allGames.find((game) => game.id === selectedGame);

    return (
        <div className="games-page">
            <h1 className="page-title">My Games and Projects</h1>
            {selectedGame && selectedGameData ? (
                <div className="game-viewer-wrapper">
                    <GameViewer
                        gamePath={selectedGameData.path}
                        instructions={selectedGameData.instructions}
                        onClose={handleCloseViewer}
                    />
                </div>
            ) : (
                <div className="game-sections">
                    <div className="game-section">
                        <h2 onClick={toggleMultiplayerSection} className="section-title">
                            Multiplayer Browser Games {multiplayerExpanded ? '▼' : '▶'}
                        </h2>
                        {multiplayerExpanded && (
                            <div className="game-list">
                                {gamesData.multiplayerGames.map((game: Game) => (
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
                        <h2 onClick={toggleGamemakerSection} className="section-title">
                            Made With GameMaker. Play in browser. {gamemakerExpanded ? '▼' : '▶'}
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
                            Made With Godot. Play in browser. {godotExpanded ? '▼' : '▶'}
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
