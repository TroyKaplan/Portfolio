// src/data/games.ts

export interface Game {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    path: string;
    instructions: string; // New field for game instructions
}

const gameMakerGames: Game[] = [
    {
        id: 'MainQuest2',
        title: 'Android Mobile Game',
        description: 'Android Mobile Game, Test in browser!!',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/MainQuest2NewThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/MainQuest2/index.html`,
        instructions: 'Use arrow keys to move. Press spacebar to jump. Collect coins and avoid obstacles.',
    },
    {
        id: 'TopDownRogueLike',
        title: 'Top Down Rogue Like',
        description: 'A classic prototype',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/TopdownRoguelikeThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/TopdownRoguelike/index.html`,
        instructions: 'Use WASD to move. Left-click to attack. Explore the dungeon and defeat enemies.',
    },
    {
        id: 'CoopAdventure',
        title: 'Co-op Adventure',
        description: 'Simple same keyboard co-op',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/CoopAdventureThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/CoopAdventure/index.html`,
        instructions: 'Use WASD to move. Left-click to attack. Explore the dungeon and defeat enemies.',
    },
    {
        id: 'CompMultiplayerUCCS',
        title: 'Competitive Multiplayer',
        description: 'Simple same keyboard competition',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/CompMultiplayerUCCSThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/CompetitiveMultiplayerUCCS/index.html`,
        instructions: 'Use WASD to move. Left-click to attack. Explore the dungeon and defeat enemies.',
    },
    //add more
];
const godotGames: Game[] = [
    {
        id: 'First Game',
        title: 'MP Dedicated Server',
        description: 'Browser based multiplayer game, runs on a dedicated server through ec2 instance.',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/BasicSmoke.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/FirstGameGodot/First Game.html`,
        instructions: 'Use arrow keys to move. Press spacebar to jump. Collect coins and play with friends.',
    },
    //add more
];

export default { gameMakerGames, godotGames };
