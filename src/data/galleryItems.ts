export interface GalleryItem {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    media: MediaItem[];
    repositoryLink?: string;
}

export interface MediaItem {
    type: 'image' | 'video' | 'audio';
    source: string; // URL or embed link
    format?: 'embed' | 'file'; // Optional field to specify video format
}

const galleryItems: GalleryItem[] = [
    {
        id: 'item1',
        title: 'Visuals and VFX',
        description: 'A Collection of screenshots and videos of some VFX',
        thumbnail: '/assets/images/PinkBlast2.png',
        media: [
            { type: 'image', source: '/assets/images/BasicSmoke.png' },
            { type: 'image', source: '/assets/images/ColoredSmoke0.png' },
            { type: 'image', source: '/assets/images/ColoredSmoke1.png' },
            { type: 'video', source: '/assets/videos/MonsterSmokeTeaser.mp4' },
            { type: 'image', source: '/assets/images/MonsterEatingBird0.png' },
            { type: 'image', source: '/assets/images/MonsterEatingBird1.png' },
            { type: 'image', source: '/assets/images/PinkBlast0.png' },
            { type: 'image', source: '/assets/images/PinkBlast1.png' },
            { type: 'image', source: '/assets/images/PinkBlast2.png' },
            { type: 'video', source: '/assets/videos/FireBlastTeaser.mp4' },
        ],
        //repositoryLink: 'https://github.com/yourusername/adventure-game',
    },
    {
        id: 'item2',
        title: 'Prototype Online',
        description: 'Random Steam networking test with destructible environment',
        thumbnail: '/assets/images/space-music-thumbnail.jpg',
        media: [
            { type: 'video', source: '/assets/videos/NewToy.mp4' },
            { type: 'audio', source: '/assets/music/space-odyssey.mp3' },
            { type: 'video', source: 'https://www.youtube.com/embed/your_video_id' },
            { type: 'audio', source: '/assets/music/adventure-game-theme.mp3' },
            { type: 'image', source: '/assets/images/PinkBlast2.png' },
        ],
    },
    {
        id: 'item3',
        title: 'Random Collection of Game Prototypes',
        description: 'Short Prototype Videos',
        thumbnail: '/assets/images/space-music-thumbnail.jpg',
        media: [
            { type: 'video', source: '/assets/videos/BadBotVideoShowcase.mp4' },
            { type: 'video', source: '/assets/videos/DestructibleEnvironment.mp4' },
            { type: 'video', source: '/assets/videos/InstaAddsGame.mp4' },
            { type: 'video', source: '/assets/videos/PropHuntGameLoopFinished.mp4' },
            { type: 'video', source: '/assets/videos/TeaserForHorrorGame.mp4' },
        ],
    },
    // Add more items as needed
];

export default galleryItems;
