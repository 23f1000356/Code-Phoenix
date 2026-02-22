import { useState, useEffect } from 'react';
import { TopBar } from './TopBar';

import { Inventory } from './Inventory';
import { HelpBar } from './HelpBar';
import { useGame } from '../contexts/GameContext';
import { soundManager } from '../utils/sound';
import RoomEffectController from '../effects/RoomEffectController';

const PIANO_KEYS = [
    { note: 'C', isWhite: true },
    { note: 'C#', isWhite: false },
    { note: 'D', isWhite: true },
    { note: 'D#', isWhite: false },
    { note: 'E', isWhite: true },
    { note: 'F', isWhite: true },
    { note: 'F#', isWhite: false },
    { note: 'G', isWhite: true },
    { note: 'G#', isWhite: false },
    { note: 'A', isWhite: true },
    { note: 'A#', isWhite: false },
    { note: 'B', isWhite: true },
];

const CORRECT_SEQUENCE = ['C', 'E', 'G', 'D'];

const PIANO_HINTS = [
    'Listen with your eyes: the candles mark how many notes you must play.',
    'You are looking for a simple four-note melody that feels like an ending.',
    'Those four notes, played in order, reveal the year of her death: 1-9-1-2.',
];


export function PianoRoom() {
    const { gameState, solvePuzzle, addToInventory, changeRoom, consumeHint } = useGame();
    const [currentSequence, setCurrentSequence] = useState<string[]>([]);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [solved, setSolved] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [candleGlow, setCandleGlow] = useState(false);
    const [revealedHintIndex, setRevealedHintIndex] = useState(-1);
    const [hintMessage, setHintMessage] = useState<string | null>(null);

    const [effects] = useState(() => new RoomEffectController('piano'));
    const [sheetMusicState, setSheetMusicState] = useState('idle'); // idle, lift, flip, final, rapid_flip
    const [lightingBoost, setLightingBoost] = useState(0);

    const [entryPhase, setEntryPhase] = useState(0);

    useEffect(() => {
        setEntryPhase(5);

        if (!gameState.solvedPuzzles.includes('piano')) {
            effects.triggerEntry();
        } else {
            setSheetMusicState('final');
        }

        return () => {
            effects.triggerExit();
        };
    }, [effects, gameState.solvedPuzzles]);

    useEffect(() => {
        if (gameState.solvedPuzzles.includes('piano')) {
            setSolved(true);
            setShowCode(true);
        }
    }, [gameState.solvedPuzzles]);

    useEffect(() => {
        if (currentSequence.length === CORRECT_SEQUENCE.length) {
            const isCorrect = currentSequence.every((note, index) => note === CORRECT_SEQUENCE[index]);

            if (isCorrect) {
                effects.triggerSolve();
                setSheetMusicState('rapid_flip');
                setSolved(true);
                setCandleGlow(true);
                setTimeout(() => {
                    setShowCode(true);
                    solvePuzzle('piano');
                    addToInventory({ id: 'code-1912', name: 'Code: 1912', icon: '📜' });
                }, 1500);
            } else {
                effects.triggerErrorEffect();
                setLightingBoost(0);
                setTimeout(() => {
                    setCurrentSequence([]);
                }, 500);
            }
        }
    }, [currentSequence, solvePuzzle, addToInventory]);

    const handleRevealHint = () => {
        const used = consumeHint();
        if (used) {
            const next = revealedHintIndex + 1;
            setRevealedHintIndex(next);
            setHintMessage(PIANO_HINTS[Math.min(next, PIANO_HINTS.length - 1)]);
        }
    };

    const handleKeyPress = (note: string) => {
        if (solved) return;

        soundManager.playPianoKey(note);
        setActiveKey(note);
        setTimeout(() => setActiveKey(null), 200);

        if (currentSequence.length < CORRECT_SEQUENCE.length) {
            const newSeq = [...currentSequence, note];
            setCurrentSequence(newSeq);

            const isCorrectSoFar = newSeq.every((n, i) => n === CORRECT_SEQUENCE[i]);
            if (!isCorrectSoFar && newSeq.length > 0) {
                effects.triggerErrorEffect();
                setLightingBoost(0);
            } else {
                setLightingBoost(prev => prev + 0.2);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0E] relative overflow-hidden">


            <TopBar roomTitle="The Silent Sonata" />

            <div className="absolute top-20 left-0 right-0 z-40 px-6 flex justify-center pointer-events-none">
                <div className="w-full max-w-2xl bg-[#1A120E]/95 backdrop-blur-sm border border-[#C6A15B]/20 rounded-lg shadow-xl px-5 py-3 text-center pointer-events-auto">
                    <div className="text-[10px] text-[#C6A15B] font-semibold tracking-widest uppercase mb-1">Clue</div>
                    <p className="text-[#EDEDED] font-serif text-sm leading-snug whitespace-pre-line">
                        Alphanumeric Cipher: A=1, B=2, C=3...
                        Decode sequence: 3-5-7-4.
                    </p>
                </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0B0B0E_80%)]" />

                <div className="relative w-full max-w-6xl h-full flex flex-col items-center justify-center gap-16 px-8">
                    <div className="relative">
                        <div className="absolute -inset-32 bg-[radial-gradient(ellipse_at_center,rgba(106,15,27,0.2)_0%,transparent_70%)] blur-3xl animate-pulse" style={{ opacity: 1 + lightingBoost }} />

                        <div
                            className={`relative bg-gradient-to-b from-[#1A120E] to-[#0B0B0E] p-12 rounded-lg
                         shadow-[0_0_50px_rgba(106,15,27,0.3)] transition-all duration-1000
                         ${candleGlow ? 'shadow-[0_0_80px_rgba(177,18,38,0.6)]' : ''}`}
                            style={{ filter: `brightness(${1 + lightingBoost})` }}
                        >
                            {/* Candles */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-8">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="relative">
                                        <div
                                            className={`w-2 bg-gradient-to-t from-[#C6A15B] to-[#FFE4B5] rounded-full
                                 transition-all duration-700 ${candleGlow ? 'h-16 drop-shadow-[0_0_12px_rgba(198,161,91,0.8)]' : 'h-12'}`}
                                        />
                                        <div
                                            className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full
                                 bg-[#FFE4B5] blur-sm transition-all duration-700
                                 ${candleGlow ? 'scale-150' : ''}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Sheet Music Animation */}
                            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-32 h-40 bg-[#EDEDED] shadow-xl border border-[#9C9C9C]/30 flex flex-col items-center justify-center transform perspective-1000 transition-all duration-500 overflow-hidden"
                                style={{
                                    transform: `translateX(-50%) rotateX(10deg) ${sheetMusicState === 'idle' ? 'translateY(1px)' : ''}`,
                                    animation: sheetMusicState === 'idle' ? 'subtleFloat 4s ease-in-out infinite' : 'none',
                                    opacity: 0.9,
                                }}>
                                <div className="text-[6px] text-[#2A1E16] opacity-30 whitespace-pre-line leading-relaxed">
                                    {`♪ ♫ ♬ ♩\n♩ ♪ ♫ ♬\n♫ ♬ ♩ ♪`}
                                </div>
                                {sheetMusicState !== 'idle' && (
                                    <div className={`absolute inset-0 bg-white transform origin-left transition-transform duration-1000
                                        ${sheetMusicState === 'lift' ? 'rotateY(-20deg) translateZ(10px) shadow-lg' : ''}
                                        ${sheetMusicState === 'flip' ? 'animate-[flipPage_0.4s_ease-in-out_2]' : ''}
                                        ${sheetMusicState === 'rapid_flip' ? 'animate-[flipPage_0.1s_linear_10]' : ''}
                                    `} />
                                )}
                            </div>

                            {/* Piano keys */}
                            <div className="mt-28 flex gap-1 relative z-10">
                                {PIANO_KEYS.map((key) => {
                                    const isActive = activeKey === key.note;
                                    const isInSequence = currentSequence.includes(key.note);

                                    if (key.isWhite) {
                                        return (
                                            <button
                                                key={key.note}
                                                onClick={() => handleKeyPress(key.note)}
                                                disabled={solved}
                                                className={`w-16 h-64 bg-gradient-to-b from-[#EDEDED] to-[#D0D0D0]
                                   border-2 border-[#2A1E16] rounded-b-lg shadow-lg
                                   transition-all duration-150 relative
                                   ${isActive ? 'translate-y-2 from-[#C6A15B] to-[#B8935F]' : 'hover:from-[#F5F5F5] hover:to-[#E0E0E0]'}
                                   ${solved ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                                   ${isInSequence && !solved ? 'border-[#C6A15B]' : ''}`}
                                            >
                                                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-serif text-[#2A1E16]">
                                                    {key.note}
                                                </span>
                                            </button>
                                        );
                                    } else {
                                        return (
                                            <button
                                                key={key.note}
                                                onClick={() => handleKeyPress(key.note)}
                                                disabled={solved}
                                                className={`w-10 h-40 bg-gradient-to-b from-[#1A120E] to-[#0B0B0E]
                                   border border-[#2A1E16] rounded-b-lg shadow-2xl
                                   -ml-5 -mr-5 z-10 transition-all duration-150
                                   ${isActive ? 'translate-y-2 from-[#6A0F1B] to-[#4A0A10]' : 'hover:from-[#2A1E16] hover:to-[#1A120E]'}
                                   ${solved ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                                   ${isInSequence && !solved ? 'border-[#C6A15B]' : ''}`}
                                            >
                                                <span className="text-[8px] font-serif text-[#EDEDED] opacity-50">{key.note}</span>
                                            </button>
                                        );
                                    }
                                })}
                            </div>

                            {/* Sequence progress + instructions + hints */}
                            <div className="mt-8 text-center space-y-3">
                                <div className="flex gap-2 justify-center">
                                    {CORRECT_SEQUENCE.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-3 h-3 rounded-full border border-[#9C9C9C] transition-all duration-300
                                 ${currentSequence[index] ? 'bg-[#C6A15B] border-[#C6A15B]' : 'bg-transparent'}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-[#9C9C9C]/80 font-serif text-xs tracking-wider">
                                    Which four notes, played in order, echo the truth she never spoke?
                                </p>
                                <p className="text-[#9C9C9C]/60 font-serif text-[11px]">
                                    Tap the keys to try a four-note melody. The dots fill as you play each note.
                                </p>
                                <div className="flex justify-center mt-2">
                                    <button
                                        type="button"
                                        onClick={handleRevealHint}
                                        disabled={solved || gameState.hintsRemaining <= 0}
                                        className="px-6 py-2 bg-[#1A120E] hover:bg-[#2A2018] text-[#C6A15B] tracking-[0.2em] font-bold text-[10px] uppercase border border-[#C6A15B]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Hints ({gameState.hintsRemaining})
                                    </button>
                                </div>
                                {hintMessage && (
                                    <div className="mt-2 max-w-xl mx-auto px-4 py-3 bg-[#1A120E]/90 border border-[#C6A15B]/30 rounded">
                                        <p className="text-[#EDEDED] font-serif text-sm">💡 {hintMessage}</p>
                                    </div>
                                )}
                                <p className="text-[#9C9C9C]/50 font-serif text-xs tracking-wider">
                                    {solved ? 'MELODY COMPLETE' : `${currentSequence.length} / ${CORRECT_SEQUENCE.length} notes`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Solved overlay */}
                    {showCode && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0B0B0E]/90 backdrop-blur-sm animate-fade-in z-40">
                            <div className="bg-[#1A120E] border-2 border-[#C6A15B] p-12 rounded-lg shadow-2xl text-center">
                                <h2 className="text-4xl font-serif text-[#EDEDED] mb-6">Code Revealed</h2>
                                <div className="text-6xl font-serif text-[#C6A15B] tracking-wider mb-8 drop-shadow-[0_0_12px_rgba(198,161,91,0.6)]">
                                    1912
                                </div>
                                <p className="text-[#9C9C9C] font-serif mb-6">The year she died…</p>
                                <button
                                    onClick={() => changeRoom('furniture')}
                                    className="px-8 py-3 bg-[#6A0F1B] hover:bg-[#B11226] text-[#EDEDED] font-serif
                             transition-colors duration-300 border border-[#C6A15B]/30"
                                >
                                    Continue to Next Room
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <HelpBar
                disabled={solved}
                onSkip={() => changeRoom('furniture')}
                nextRoomLabel="Furniture Room"
                answerContent={
                    <div>
                        <p className="text-[#9C9C9C] mb-4 text-sm">Play these four notes in order:</p>
                        <div className="flex gap-3 justify-center">
                            {['C', 'E', 'G', 'D'].map((note, i) => (
                                <div key={note} className="flex flex-col items-center gap-1">
                                    <span className="text-xs text-[#9C9C9C]">{i + 1}</span>
                                    <div className="w-12 h-12 bg-[#C6A15B]/20 border border-[#C6A15B] rounded flex items-center justify-center text-[#C6A15B] font-serif text-lg font-bold">
                                        {note}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                }
            />

            <div className="absolute bottom-48 left-0 right-0 flex justify-center pointer-events-none">
                <Inventory />
            </div>

            {/* Ambient corner glows */}
            <div className="absolute inset-0 pointer-events-none">
                <style>{`
                    @keyframes subtleFloat {
                        0%, 100% { transform: translateX(-50%) rotateX(10deg) translateY(0); }
                        50% { transform: translateX(-50%) rotateX(10deg) translateY(-3px); }
                    }
                    @keyframes flipPage {
                        0% { transform: rotateY(0deg) translateZ(0px); opacity: 1; }
                        50% { transform: rotateY(-90deg) translateZ(20px); opacity: 0.8; }
                        100% { transform: rotateY(-180deg) translateZ(0px); opacity: 0; }
                    }
                `}</style>
                <div className="absolute top-0 left-0 w-64 h-64 bg-[#6A0F1B]/10 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B11226]/10 blur-3xl animate-pulse delay-1000" />
            </div>
        </div>
    );
}
