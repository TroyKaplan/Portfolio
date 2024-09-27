import React from 'react';
import './GameViewer.css'; // Import CSS for styling

interface GameViewerProps {
    gamePath: string;
    onClose: () => void;
}

const GameViewer: React.FC<GameViewerProps> = ({ gamePath, onClose }) => {
    return (
        <div className="game-viewer">
            <button className="close-button" onClick={onClose}>
                Close
            </button>
            <iframe
                src={gamePath}
                title="Game"
                width="100%"
                height="1000px"
                //frameBorder="0"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default GameViewer;
