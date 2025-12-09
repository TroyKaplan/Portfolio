import React from 'react';
import { GalleryItem as GalleryItemData } from '../data/galleryItems';
import '../styles/GalleryItem.css';

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
            <div className="item-info">
                <h3>{item.title}</h3>
                <div className="description-box">
                    <p>{item.description}</p>
                </div>
            </div>
        </div>
    );
};

export default GalleryItem;

