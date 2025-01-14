// GalleryViewer.tsx
import React, { useState, useEffect } from 'react';
import { GalleryItem, MediaItem } from '../data/galleryItems';
import './GalleryViewer.css';
import logger from '../utils/logger';
import { useDeviceInfo } from '../hooks/useDeviceInfo';

interface GalleryViewerProps {
    item: GalleryItem;
    onClose: () => void;
}

const GalleryViewer: React.FC<GalleryViewerProps> = ({ item, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const deviceClass = useDeviceInfo();
    const mediaItems = item.media;

    useEffect(() => {
        logger.log('info', 'GalleryViewer', 'Media rendered with device class:', {
            deviceClass,
            mediaType: item.media[currentIndex].type,
            dimensions: {
                containerWidth: document.querySelector('.media-container')?.clientWidth,
                containerHeight: document.querySelector('.media-container')?.clientHeight
            }
        });
    }, [deviceClass, currentIndex, item.media]);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + mediaItems.length) % mediaItems.length);
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
    };

    const renderMedia = (media: MediaItem) => {
        logger.log('debug', 'GalleryViewer', 'Rendering media:', {
            type: media.type,
            source: media.source,
            deviceClass
        });
        
        switch (media.type) {
            case 'image':
                return <img key={media.source} src={media.source} alt={item.title} />;
            case 'video':
                if (isEmbedVideo(media.source)) {
                    return (
                        <iframe
                            key={media.source}
                            src={media.source}
                            title={item.title}
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                    );
                } else {
                    return (
                        <video key={media.source} controls width="100%" height="auto">
                            <source src={media.source} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    );
                }
            case 'audio':
                return (
                    <audio key={media.source} controls>
                        <source src={media.source} type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                );
            default:
                return null;
        }
    };

    const getOptimizedImageSource = (source: string, deviceClass: string) => {
        // If the image is from a CDN or service that supports dynamic resizing
        if (source.includes('imagecdn.com')) {
            return source;
        }
        
        // For local images, we'll need to handle different sizes
        const basePath = source.split('?')[0];
        
        switch (deviceClass) {
            case 'high-res':
                return `${basePath}?quality=90&w=1920`;
            case 'standard':
                return `${basePath}?quality=85&w=1200`;
            case 'tablet':
                return `${basePath}?quality=80&w=900`;
            case 'mobile':
            case 'mobile-landscape':
                return `${basePath}?quality=75&w=600`;
            default:
                return source;
        }
    };

    const isEmbedVideo = (source: string) => {
        return source.includes('youtube.com') || source.includes('youtu.be') || source.includes('vimeo.com');
    };

    return (
        <div className="gallery-viewer">
            <button className="close-button" onClick={onClose} aria-label="Close Viewer">
                &times;
            </button>
            <div className={`viewer-content ${deviceClass}`}>
                <h2>{item.title}</h2>
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
                <div className="media-description">
                    <p>{mediaItems[currentIndex].description || item.description}</p>
                </div>
                <div className="thumbnail-gallery">
                    {mediaItems.map((media, index) => (
                        <div
                            key={media.source}
                            className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(index)}
                        >
                            {media.type === 'image' && (
                                <img src={media.source} alt={`Thumbnail ${index + 1}`} />
                            )}
                            {media.type === 'video' && (
                                <img src={media.thumbnail || `${process.env.PUBLIC_URL}/assets/default_video_thumbnail.jpg`} alt={`Thumbnail ${index + 1}`} />
                            )}
                            {media.type === 'audio' && (
                                <img src={media.thumbnail || `${process.env.PUBLIC_URL}/assets/default_audio_thumbnail.jpg`} alt={`Thumbnail ${index + 1}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GalleryViewer;
