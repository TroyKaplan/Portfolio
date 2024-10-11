import React, { useState } from 'react';
import GalleryItem from '../components/GalleryItem';
import GalleryViewer from '../components/GalleryViewer';
import galleryItems from '../data/galleryItems';
import './GalleryPage.css';

const GalleryPage: React.FC = () => {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const handleItemClick = (id: string) => {
        setSelectedItemId(id);
    };

    const handleCloseViewer = () => {
        setSelectedItemId(null);
    };

    const selectedItem = galleryItems.find((item) => item.id === selectedItemId);

    return (
        <div className="gallery-page">
            <h1 className="page-title">My Gallery</h1>
            {selectedItem ? (
                <GalleryViewer item={selectedItem} onClose={handleCloseViewer} />
            ) : (
                <div className="gallery-grid">
                    {galleryItems.map((item) => (
                        <GalleryItem key={item.id} item={item} onClick={() => handleItemClick(item.id)} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default GalleryPage;
