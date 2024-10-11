import React, { useState, useEffect, useRef } from 'react';
import './GameViewer.css'; // Import CSS for styling

interface GameViewerProps {
    gamePath: string;
    instructions: string;
    onClose: () => void;
}

const GameViewer: React.FC<GameViewerProps> = ({ gamePath, instructions, onClose }) => {
    const [isInstructionsVisible, setIsInstructionsVisible] = useState(true);
    const instructionsRef = useRef<HTMLDivElement>(null);

    const toggleInstructions = () => {
        setIsInstructionsVisible(!isInstructionsVisible);
    };

    useEffect(() => {
        if (isInstructionsVisible && instructionsRef.current) {
            instructionsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [isInstructionsVisible]);

    return (
        <div className="game-viewer">
            <button className="close-button" onClick={onClose}>
                Close
            </button>
            <iframe
                src={gamePath}
                title="Game"
                width="100%"
                height="800px"
                allowFullScreen
            ></iframe>
            <div className="instructions-container" ref={instructionsRef}>
                <button className="toggle-instructions" onClick={toggleInstructions}>
                    {isInstructionsVisible ? 'Hide Instructions' : 'Show Instructions'}
                </button>
                {isInstructionsVisible && (
                    <div className="instructions">
                        <h3>Instructions</h3>
                        <p>{instructions}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameViewer;
