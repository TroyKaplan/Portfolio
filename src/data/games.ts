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
        title: 'Android Mobile Game',
        description: 'Android Mobile Game, Test in browser!!',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/MainQuest2NewThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/MainQuest2/index.html`,
    },
    {
        id: 'TopDownRogueLike',
        title: 'Top Down Rogue Like',
        description: 'A classic prototype',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/TopDownRogueLikeThumbnailNew.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/TopDownRoguelike/index.html`,
    },
    {
        id: 'CoopAdventure',
        title: 'Co-op Adventure',
        description: 'Simple same keyboard co-op',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/CoopAdventureThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/CoopAdventure/index.html`,
    },
    {
        id: 'CompMultiplayerUCCS',
        title: 'Competitive Multiplayer',
        description: 'Simple same keyboard competition',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/CompMultiplayerUCCSThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/CompetitiveMultiplayerUCCS/index.html`,
    },
    //add more
];

export default games;
