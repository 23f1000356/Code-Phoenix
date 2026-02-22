export type RoomName = 'menu' | 'piano' | 'furniture' | 'clock' | 'mirror' | 'wall';

export interface InventoryItem {
    id: string;
    name: string;
    icon: string;
}

export interface FurnitureItem {
    id: string;
    type: 'sofa' | 'chair' | 'table' | 'ottoman';
    x: number;
    y: number;
    rotation: number;
}

export interface GameState {
    currentRoom: RoomName;
    timeRemaining: number;
    hintsRemaining: number;
    inventory: InventoryItem[];
    solvedPuzzles: string[];
}
