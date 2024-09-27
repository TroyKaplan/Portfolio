import React, { useState, useEffect } from 'react';

const GameEmbed: React.FC = () => {
    const [isGameLoaded, setIsGameLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Function to dynamically load the game
    const loadGame = () => {
        setIsLoading(true);
        setIsGameLoaded(true);
    };

    useEffect(() => {
        if (isGameLoaded) {
            // Create a new script element to load the game's JavaScript
            const script = document.createElement('script');
            script.src = '/assets/games/TopDownRoguelike/index.html'; // Path to your game's main JS file
            script.async = true;

            // Append the script to the document body to start loading the game
            document.body.appendChild(script);

            // Wait for the script to load before calling the game init function
            script.onload = () => {
                // Make sure the GameMaker_Init function is available
                if (typeof (window as any).GameMaker_Init === 'function') {
                    (window as any).GameMaker_Init(); // Call the GameMaker initialization function
                    setIsLoading(false); // Game is loaded
                } else {
                    console.error('GameMaker_Init function not found');
                }
            };

            return () => {
                // Clean up script if the component is unmounted
                document.body.removeChild(script);
            };
        }
    }, [isGameLoaded]);

    return (
        <div>
            {/* Display a button that loads the game when clicked */}
            {!isGameLoaded &&
                <button onClick={loadGame} style={{padding: '10px 20px', fontSize: '16px', cursor: 'pointer'}}>
                    Load Game
                </button>}

            {/* This div will act as the container for the game */}
            {isGameLoaded && (
                <div className="gm4html5_div_class" id="gm4html5_div_id">
                    <canvas id="canvas" width="1600" height="900">
                        <p>Your browser doesn't support HTML5 canvas.</p>
                    </canvas>
                    {isLoading && <p>Loading game...</p>}
                </div>
            )}
        </div>
    );
};

export default GameEmbed;
