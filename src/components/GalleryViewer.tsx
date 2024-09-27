import React, { useState } from 'react';
import { GalleryItem, MediaItem } from '../data/galleryItems';
import './GalleryViewer.css';

interface GalleryViewerProps {
    item: GalleryItem;
    onClose: () => void;
}

const GalleryViewer: React.FC<GalleryViewerProps> = ({ item, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const mediaItems = item.media;

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = (prevIndex - 1 + mediaItems.length) % mediaItems.length;
            console.log('Previous button clicked, new index:', newIndex);
            return newIndex;
        });
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = (prevIndex + 1) % mediaItems.length;
            console.log('Next button clicked, new index:', newIndex);
            return newIndex;
        });
    };

    const renderMedia = (media: MediaItem) => {
        switch (media.type) {
            case 'image':
                return <img src={media.source} alt={item.title} />;
            case 'video':
                // Check if the source is a YouTube or Vimeo link
                if (isEmbedVideo(media.source)) {
                    return (
                        <iframe
                            src={media.source}
                            title={item.title}
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    );
                } else {
                    // Render local video file
                    return (
                        <video controls width="100%" height="auto">
                            <source src={media.source} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    );
                }
            case 'audio':
                return (
                    <audio controls>
                        <source src={media.source} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                );
            default:
                return null;
        }
    };

    // Helper function to determine if a video source is an embed link
    const isEmbedVideo = (source: string) => {
        return source.includes('youtube.com') || source.includes('youtu.be') || source.includes('vimeo.com');
    };

    return (
        <div className="gallery-viewer">
            <button className="close-button" onClick={onClose} aria-label="Close Viewer">
                &times;
            </button>
            <div className="viewer-content">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
                {item.repositoryLink && (
                    <p>
                        <a href={item.repositoryLink} target="_blank" rel="noopener noreferrer">
                            View Repository
                        </a>
                    </p>
                )}
                {mediaItems.length > 0 && (
                    <div className="media-container">
                        <button className="nav-button prev-button" onClick={handlePrev} aria-label="Previous Media">
                            &#10094;
                        </button>
                        <div className="media-content">
                            {renderMedia(mediaItems[currentIndex])}
                        </div>
                        <button className="nav-button next-button" onClick={handleNext} aria-label="Next Media">
                            &#10095;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GalleryViewer;
