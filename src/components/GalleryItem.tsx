import React from 'react';
import { GalleryItem as GalleryItemData } from '../data/galleryItems';
import './GalleryItem.css';

interface GalleryItemProps {
    item: GalleryItemData;
    onClick: () => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, onClick }) => {
    return (
        <div className="gallery-item" onClick={onClick}>
            <div className="thumbnail-container">
                <img src={item.thumbnail} alt={`${item.title} Thumbnail`} loading="lazy" />
                <div className="overlay">
                    <span className="overlay-text">View Details</span>
                </div>
            </div>
            <h3>{item.title}</h3>
        </div>
    );
};

export default GalleryItem;
