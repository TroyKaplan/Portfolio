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
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/PinkBlast2.png`,
        media: [
            { type: 'video', source: `${process.env.PUBLIC_URL}/assets/videos/FireBlastTeaser.mp4` },
            { type: 'image', source: `${process.env.PUBLIC_URL}/assets/images/BasicSmoke.png` },
            { type: 'image', source: `${process.env.PUBLIC_URL}/assets/images/ColoredSmoke0.png` },
            { type: 'image', source: `${process.env.PUBLIC_URL}/assets/images/ColoredSmoke1.png` },
            { type: 'image', source: `${process.env.PUBLIC_URL}/assets/images/MonsterEatingBird0.png` },
            { type: 'image', source: `${process.env.PUBLIC_URL}/assets/images/MonsterEatingBird1.png` },
        ],
        //repositoryLink: 'https://github.com/yourusername/adventure-game',
    },
    {
        id: 'item2',
        title: 'Prototype Online',
        description: 'Random Steam networking test with destructible environment',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/POMaps.png`,
        media: [
            { type: 'video', source: `${process.env.PUBLIC_URL}/assets/videos/POQuickShowcase.mp4` },
            { type: 'image', source: `${process.env.PUBLIC_URL}/assets/images/POMaps.png` },
            { type: 'image', source: `${process.env.PUBLIC_URL}/assets/images/PORocketLauncher.png` },
        ],
    },
    {
        id: 'item3',
        title: 'ProjectX',
        description: 'All of my current work',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/WolfStudios.png`,
        media: [
            { type: 'video', source: `${process.env.PUBLIC_URL}/assets/videos/POQuickShowcase.mp4` },
            { type: 'image', source: `${process.env.PUBLIC_URL}/assets/images/POMaps.png` },
            { type: 'image', source: `${process.env.PUBLIC_URL}/assets/images/PORocketLauncher.png` },
        ],
    },
    {
        id: 'item4',
        title: 'Random Collection of Game Prototypes (not started)',
        description: 'Short Prototype Videos',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/space-music-thumbnail.jpg`,
        media: [
            { type: 'video', source: `${process.env.PUBLIC_URL}/assets/videos/BadBotVideoShowcase.mp4` },
            { type: 'video', source: `${process.env.PUBLIC_URL}/assets/videos/DestructibleEnvironment.mp4` },
            { type: 'video', source: `${process.env.PUBLIC_URL}/assets/videos/InstaAddsGame.mp4` },
            { type: 'video', source: `${process.env.PUBLIC_URL}/assets/videos/PropHuntGameLoopFinished.mp4` },
            { type: 'video', source: `${process.env.PUBLIC_URL}/assets/videos/TeaserForHorrorGame.mp4` },
            { type: 'audio', source: `${process.env.PUBLIC_URL}/assets/music/space-odyssey.mp3` },
            { type: 'video', source: 'https://www.youtube.com/embed/your_video_id' },
        ],
    },
    // Add more items as needed
];

export default galleryItems;
