// src/data/games.ts

export interface Game {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    path: string;
}

const games: Game[] = [
    {
        id: 'MainQuest2',
        title: 'Main Quest 2!',
        description: 'Android Mobile Game, Test in browser!!',
        thumbnail: '/assets/images/MainQuest2NewThumbnail.png',
        path: '/assets/games/MainQuest2/index.html',
    },
    {
        id: 'TopDownRogueLike',
        title: 'Top Down Rogue Like',
        description: 'A classic prototype',
        thumbnail: '/assets/images/game2-thumbnail.jpg',
        path: '/assets/games/TopDownRoguelike/index.html',
    },
    // Add more games as needed
];

export default games;
