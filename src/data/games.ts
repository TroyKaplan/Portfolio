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
        title: 'TopDown RogueLike',
        description: 'Can you beat the boss?? Art by @Brtklob',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/tdrl-image.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/tdrl-demo/index.html`,
        instructions: 'Use WASD to move. Left-click to attack. Explore the dungeon and defeat enemies.',
    },
    {
        id: 'MainQuest2',
        title: 'Android Mobile Game',
        description: 'Android Mobile Game, test on your phone too! (Resolution WIP)',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/MainQuest2NewThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/MainQuest2/index.html`,
        instructions: 'Use arrow keys to move. Press spacebar to jump. Collect coins and avoid obstacles.',
    },
    {
        id: 'CoopAdventure',
        title: 'Co-op Adventure',
        description: 'Simple same keyboard co-op puzzle action game',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/CoopAdventureThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/CoopAdventure/index.html`,
        instructions: 'Use WASD to move. Left/Right-click to attack. 1 and 2 to switch camera views. Arrow keys to move second player',
    },
    {
        id: 'CompMultiplayerUCCS',
        title: 'Competitive Multiplayer',
        description: 'Simple same keyboard competition',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/CompMultiplayerUCCSThumbnail.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/CompetitiveMultiplayerUCCS/index.html`,
        instructions: 'WASD and left control for left plane, arrow keys and right control for right plane, maybe shift.',
    },
    //add more
];
const godotGames: Game[] = [
    {
        id: 'Pong',
        title: 'Pong',
        description: 'Classic Pong',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/Pong.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/PongGodot/index.html`,
        instructions: 'Use arrow keys to move right paddle. W and S to move paddle up and down.',
    },
    //add more
];
const multiplayerGames: Game[] = [
    {
        id: 'RocketGame',
        title: 'Rocket Game',
        description: 'Hosted on dedicated server',
        thumbnail: `${process.env.PUBLIC_URL}/assets/images/rocket-game-image.png`,
        path: `${process.env.PUBLIC_URL}/assets/games/rocket-game-html5/index.html`,
        instructions: 'Use A and D keys to rotate. Press W to fly',
    },
    //add more
];

export default { gameMakerGames, godotGames, multiplayerGames };
