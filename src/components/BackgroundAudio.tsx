import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';

const AUDIO_MAP: Record<string, string> = {
    landing: '/MUSIC/HOME.mp3',
    menu: '/MUSIC/HOME.mp3',
    mirror: '/MUSIC/CIPHER.mp3',
    piano: '/MUSIC/PIANO.mp3',
    furniture: '/MUSIC/PUZZLE.mp3',
    clock: '/MUSIC/CLOCK.mp3',
    wall: '/MUSIC/WALL (2).mp3',
};

export function BackgroundAudio() {
    const { gameState } = useGame();
    const location = useLocation();
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        let currentTrack = AUDIO_MAP.landing;

        if (location.pathname === '/' || location.pathname === '/lobby') {
            currentTrack = AUDIO_MAP.landing;
        } else {
            currentTrack = AUDIO_MAP[gameState.currentRoom] || AUDIO_MAP.landing;
        }

        if (!audioRef.current) {
            audioRef.current = new Audio(currentTrack);
            audioRef.current.loop = true;
        } else if (audioRef.current.src !== window.location.origin + currentTrack) {
            audioRef.current.src = currentTrack;
        }

        audioRef.current.volume = isMuted ? 0 : volume;

        // Must handle auto-play restrictions gracefully
        audioRef.current.play().catch(e => console.log('Autoplay blocked:', e));

        return () => {
            // Don't kill audio on unmount so it persists between re-renders if needed
        };
    }, [location.pathname, gameState.currentRoom]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 bg-black/60 backdrop-blur-md border border-[#C6A15B]/30 p-2 rounded-full shadow-lg transition-all hover:bg-black/80">
            <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-[#C6A15B] hover:text-[#EDEDED] transition-colors p-1"
            >
                {isMuted || volume === 0 ? <VolumeX size={20} /> : volume < 0.5 ? <Volume1 size={20} /> : <Volume2 size={20} />}
            </button>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    if (isMuted) setIsMuted(false);
                }}
                className="w-24 accent-[#C6A15B] cursor-pointer"
            />
        </div>
    );
}
