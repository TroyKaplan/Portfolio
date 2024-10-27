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
        id: 'TopDownRogueLike',
        title: 'Top Down Rogue Like',
        description: 'Can you beat the boss??',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/TopdownRoguelikeThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/TopdownRoguelike/index.html`,
        instructions: 'Use WASD to move. Left-click to attack. Explore the dungeon and defeat enemies.',
    },
    {
        id: 'MainQuest2',
        title: 'Android Mobile Game',
        description: 'Android Mobile Game, Test in browser!!',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/MainQuest2NewThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/MainQuest2/index.html`,
        instructions: 'Use arrow keys to move. Press spacebar to jump. Collect coins and avoid obstacles.',
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
        id: 'Pong',
        title: 'Pong',
        description: 'Basic Pong Game',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/BasicSmoke.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/PongGodot/index.html`,
        instructions: 'Use arrow keys to move right paddle. W and S to move paddle up and down.',
    },
    {
        id: 'JRPG',
        title: 'JRPG',
        description: 'Testing Different Godot Build Settings',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/BasicSmoke.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/JRPGGodot/index.html`,
        instructions: 'IDK yet',
    },
    //add more
];
const multiplayerGames: Game[] = [
    {
        id: 'SurviveIO',
        title: 'MP Dedicated Server Survivo IO',
        description: 'server runs through ec2 instance.',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/BasicSmoke.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/Survive/index.html`,
        instructions: 'Use arrow keys to move. Press spacebar to jump. Collect coins and play with friends.',
    },
    {
        id: 'RocketGame',
        title: 'Rocket Game',
        description: 'Hosted on dedicated server',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/BasicSmoke.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/rocket-game-html5/index.html`,
        instructions: 'Use A and D keys to rotate. Press W to fly',
    },
    //add more
];

export default { gameMakerGames, godotGames, multiplayerGames };
