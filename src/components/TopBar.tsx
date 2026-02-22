import { Timer } from './Timer';
import { useGame } from '../contexts/GameContext';

interface TopBarProps {
    roomTitle: string;
}

export function TopBar({ roomTitle }: TopBarProps) {
    const { gameState } = useGame();
    const { hintsRemaining } = gameState;

    return (
        <div
            className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#0B0B0E] to-transparent
                 flex items-center justify-between px-8 z-50"
        >
            <div className="flex items-center gap-6">
                <span className="text-[#B11226] font-serif tracking-widest text-sm">CIPHER</span>
                <span className="text-[#9C9C9C]/40">|</span>
                <h1 className="text-xl font-serif text-[#EDEDED] tracking-wide">{roomTitle}</h1>
            </div>

            <Timer />

            <div className="flex items-center gap-2">
                <span className="text-[#9C9C9C] font-serif text-sm">Hints:</span>
                <span className="text-[#C6A15B] font-serif text-lg">{hintsRemaining}</span>
            </div>
        </div>
    );
}
