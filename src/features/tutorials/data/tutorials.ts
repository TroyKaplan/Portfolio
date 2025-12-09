export interface Tutorial {
    id: string;
    title: string;
    content: string;
    section: 'cpp' | 'unreal';
    type: 'code' | 'iframe';
    iframeSrc?: string;
}

const tutorials: Tutorial[] = [
    {
        id: 'cpp-hello-world',
        title: 'Hello World in C++',
        content: 
`#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,
        section: 'cpp',
        type: 'code',
    },
    //copy and paste this for more tutorials
    {
        id: 'unreal-blueprint-example',
        title: 'Blueprint Example',
        content: '',
        section: 'unreal',
        type: 'iframe',
        iframeSrc: 'https://blueprintue.com/render/264_j483/',
    },
    {
        id: 'unreal-multiplayer-framework',
        title: 'Unreal Engine Multiplayer Framework',
        content: `| Class | Server Instance(s) | Client Instance(s) | Network Presence | Details |
|-------|-------------------|-------------------|------------------|----------|
| GameInstance | One per server process | One per client process | Exists independently on server and clients; not replicated | Manages game-wide systems and persists between levels. Not network-aware. Use for storing persistent data like player profiles or settings. |
| GameMode | One | None | Exists only on the server; not present on clients | Defines game rules, scoring, and game flow. Authoritative class that manages the game state and enforces rules. Clients interact indirectly through the GameState. |
| GameState | One | One (replicated from server) | Exists on both server and clients | Holds the game's state that needs to be known by all clients, such as current level, match time, or team scores. Replicates data to keep clients synchronized with the server. |
| PlayerController | One per connected player | One for the owning player | Exists on server and owning client only | Acts as the intermediary between the player and the game world. Server has one per player to manage authoritative decisions. Clients have one for local input. Not present on other clients. |
| PlayerState | One per player | One per player (replicated from server) | Exists on both server and clients | Contains player-specific state information like player name, score, and team assignment. Replicates to all clients to display stats or leaderboards. |
| Pawn/Character | One per pawn/character | One per pawn/character (replicated from server) | Exists on both server and clients | Represents the player's or AI's presence in the game world. Server controls the authoritative state. Clients receive replicated instances for all pawns/characters to represent other players and AI. |
| HUD | None | One per client | Exists only on the owning client | Manages the player's UI elements like health bars, crosshairs, and ammo counts. Client-side only; not replicated or present on the server. |
| PlayerCameraManager | None | One per client | Exists only on the owning client | Controls camera behavior for a player. Each client handles their own camera locally. Not replicated or present on the server. |
| SpectatorPawn | One per spectator (if applicable) | One per spectator (replicated from server) | Exists on both server and owning client | Represents a non-participating observer in the game world. Similar to Pawn, but used for spectators. |`,
        section: 'unreal',
        type: 'code',
    },
    // Add more tutorials here
];

export default tutorials;

