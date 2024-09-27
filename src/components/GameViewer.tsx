import React from 'react';

interface GameViewerProps {
    gamePath: string;
    onClose: () => void;
}

const GameViewer: React.FC<GameViewerProps> = ({ gamePath, onClose }) => {
    return (
        <div className="game-viewer">
            <button onClick={onClose}>Close</button>
            <iframe
                src={gamePath}
                title="Game"
                width="1920"
                height="1080"
                frameBorder="0"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default GameViewer;
