import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { TopBar } from './TopBar';

import { Inventory } from './Inventory';
import { HelpBar } from './HelpBar';
import { useGame } from '../contexts/GameContext';
import { Move } from 'lucide-react';
import RoomEffectController from '../effects/RoomEffectController';

type PuzzlePiece = {
    id: string;
    x: number;
    y: number;
    row: number;
    col: number;
};

const GRID_SIZE = 360;
const GRID_ROWS = 3;
const GRID_COLS = 3;
const CELL_SIZE = GRID_SIZE / GRID_COLS;
const ALIGN_TOLERANCE = 40;
/** Image from images folder that is broken into pieces for the puzzle */
const PUZZLE_IMAGE = '/images/pic.jpeg';

const createInitialPieces = (): PuzzlePiece[] => {
    const pieces: PuzzlePiece[] = [];
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            pieces.push({
                id: `piece-${row}-${col}`,
                x: Math.random() * 400 + 50,  // Random scattered positions
                y: Math.random() * 300 + 300, // Below the frame
                row,
                col,
            });
        }
    }
    return pieces;
};

export function FurnitureRoom() {
    const { gameState, solvePuzzle, addToInventory, changeRoom, consumeHint } = useGame();
    const [pieces, setPieces] = useState<PuzzlePiece[]>(() => createInitialPieces());
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [solved, setSolved] = useState(false);
    const [showCode, setShowCode] = useState(false);
    const [revealedHintIndex, setRevealedHintIndex] = useState(-1);
    const [hintMessage, setHintMessage] = useState<string | null>(null);
    const [frameOrigin, setFrameOrigin] = useState<{ x: number; y: number } | null>(null);

    const [effects] = useState(() => new RoomEffectController('furniture'));
    const [lightingDim, setLightingDim] = useState(false);
    const [shadowPass, setShadowPass] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

    useEffect(() => {
        effects.triggerEntry();
        setTimeout(() => {
            effects.triggerSignatureEffect();
            setLightingDim(true);
            setShadowPass(true);
            setTimeout(() => setShadowPass(false), 3000);
        }, 1500);
        return () => effects.triggerExit();
    }, [effects]);

    useEffect(() => {
        if (!frameOrigin || !pieces) return;
        let count = 0;
        pieces.forEach(piece => {
            const targetX = frameOrigin.x + piece.col * CELL_SIZE;
            const targetY = frameOrigin.y + piece.row * CELL_SIZE;
            if (Math.abs(piece.x - targetX) < ALIGN_TOLERANCE && Math.abs(piece.y - targetY) < ALIGN_TOLERANCE) {
                count++;
            }
        });
        setCorrectCount(count);
    }, [pieces, frameOrigin]);

    useEffect(() => {
        if (gameState.solvedPuzzles.includes('furniture')) {
            setSolved(true);
            setShowCode(true);
        }
    }, [gameState.solvedPuzzles, gameState.currentRoom]);

    const containerRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ startX: number; startY: number; itemX: number; itemY: number } | null>(
        null
    );

    useLayoutEffect(() => {
        const measure = () => {
            if (!containerRef.current || !frameRef.current) return;
            const cr = containerRef.current.getBoundingClientRect();
            const fr = frameRef.current.getBoundingClientRect();
            const origin = { x: fr.left - cr.left, y: fr.top - cr.top };
            setFrameOrigin(origin);

            // Initialize pieces if they are still at their initial random positions
            // or if it's the first measurement. We check if they are "uninitialized" 
            // by looking for our scattering logic.
            setPieces((prev) => {
                // Only reposition if we haven't aligned to an origin yet
                return prev.map((piece) => {
                    // If the piece is already within the frame area roughly, don't move it again
                    if (piece.y < origin.y + GRID_SIZE) return piece;

                    return {
                        ...piece,
                        x: origin.x + piece.col * CELL_SIZE + (Math.random() * 120 - 60),
                        y: origin.y + GRID_SIZE + 60 + Math.random() * 60,
                    };
                });
            });
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, []);

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        if (solved) return;
        const piece = pieces.find((p) => p.id === id);
        if (!piece) return;

        setDraggingId(id);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            itemX: piece.x,
            itemY: piece.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingId || !dragRef.current) return;

        const capturedDrag = { ...dragRef.current };
        const deltaX = e.clientX - capturedDrag.startX;
        const deltaY = e.clientY - capturedDrag.startY;

        setPieces((prev) =>
            prev.map((piece) =>
                piece.id === draggingId
                    ? {
                        ...piece,
                        x: capturedDrag.itemX + deltaX,
                        y: capturedDrag.itemY + deltaY,
                    }
                    : piece
            )
        );
    };

    const handleMouseUp = () => {
        if (draggingId && dragRef.current && frameOrigin && !solved) {
            const piece = pieces.find(p => p.id === draggingId);
            if (piece) {
                const targetX = frameOrigin.x + piece.col * CELL_SIZE;
                const targetY = frameOrigin.y + piece.row * CELL_SIZE;
                const isCorrect = Math.abs(piece.x - targetX) < ALIGN_TOLERANCE && Math.abs(piece.y - targetY) < ALIGN_TOLERANCE;
                if (isCorrect) {
                    effects.triggerProgressEffect(1);
                }
            }
        }
        setDraggingId(null);
        dragRef.current = null;
    };

    useEffect(() => {
        try {
            if (solved || !frameOrigin || !pieces || pieces.length === 0) return;

            const allAligned = pieces.every((piece) => {
                const targetX = frameOrigin.x + piece.col * CELL_SIZE;
                const targetY = frameOrigin.y + piece.row * CELL_SIZE;
                return (
                    Math.abs(piece.x - targetX) < ALIGN_TOLERANCE &&
                    Math.abs(piece.y - targetY) < ALIGN_TOLERANCE
                );
            });

            if (allAligned && !solved) {
                effects.triggerSolve();
                setShadowPass(true);
                setTimeout(() => setShadowPass(false), 1000);
                setSolved(true);
                setTimeout(() => {
                    setShowCode(true);
                    solvePuzzle('furniture');
                    addToInventory({ id: 'code-48', name: 'Code: 4.8', icon: '🧩' });
                }, 600);
            }
        } catch (err) {
            console.error("Puzzle Alignment Check Error:", err);
        }
    }, [pieces, solved, frameOrigin, solvePuzzle, addToInventory]);

    const getPieceStyle = (piece: PuzzlePiece) => {
        // 3×3 grid: each tile is one ninth; position (col,row) = (col*50)%, (row*50)%
        const backgroundPositionX = piece.col * 50;
        const backgroundPositionY = piece.row * 50;

        return {
            left: `${piece.x}px`,
            top: `${piece.y}px`,
            width: `${CELL_SIZE - 8}px`,
            height: `${CELL_SIZE - 8}px`,
            backgroundImage: `url(${PUZZLE_IMAGE})`,
            backgroundSize: `${GRID_COLS * 100}% ${GRID_ROWS * 100}%`,
            backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
        } as React.CSSProperties;
    };

    return (
        <div
            className="min-h-screen bg-[#0B0B0E] relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <TopBar roomTitle="The Order of Shadows" />

            <div className="absolute top-20 left-0 right-0 z-40 px-6 flex justify-center pointer-events-none">
                <div className="w-full max-w-2xl bg-[#1A120E]/95 backdrop-blur-sm border border-[#C6A15B]/20 rounded-lg shadow-xl px-5 py-3 text-center pointer-events-auto">
                    <div className="text-[10px] text-[#C6A15B] font-semibold tracking-widest uppercase mb-1">Clue</div>
                    <p className="text-[#EDEDED] font-serif text-sm leading-snug whitespace-pre-line">
                        The portrait is torn into pieces. Drag the squares and drop them into the central glowing grid to recreate the photograph. When complete, the image will reveal a crucial coordinate.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            const used = consumeHint();
                            if (used) {
                                const next = revealedHintIndex + 1;
                                setRevealedHintIndex(next);
                                const hints = [
                                    'Each piece belongs in a specific spot in the 3x3 grid.',
                                    'Move the pieces until the background image looks correct.',
                                    'The coordinate revealed is 4.8.'
                                ];
                                setHintMessage(hints[Math.min(next, hints.length - 1)]);
                            }
                        }}
                        disabled={solved || gameState.hintsRemaining <= 0}
                        className="mt-2 px-4 py-1.5 bg-[#1A120E] hover:bg-[#2A2018] text-[#C6A15B] tracking-[0.2em] font-bold text-[9px] uppercase border border-[#C6A15B]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        💡 Hints ({gameState.hintsRemaining})
                    </button>
                    {hintMessage && (
                        <p className="mt-2 text-[#C6A15B] font-serif text-[10px] italic">💡 {hintMessage}</p>
                    )}
                </div>
            </div>

            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${lightingDim ? 'brightness-75' : 'brightness-100'}`}>
                {/* Fireplace flicker ambient glow overlay */}
                <div className="absolute inset-0 bg-[#C6A15B]/5 mix-blend-overlay animate-[flicker_3s_infinite_alternate]" />

                {shadowPass && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[100]">
                        <div className="absolute top-0 right-0 w-[800px] h-[200vh] bg-black opacity-80 mix-blend-multiply transform -skew-x-[40deg] origin-top right-[-200px] animate-[slideShadow_3s_forwards]" />
                    </div>
                )}
                <style>{`
                    @keyframes slideShadow {
                        0% { transform: translateX(100vw) skewX(-40deg); }
                        100% { transform: translateX(-150vw) skewX(-40deg); }
                    }
                    @keyframes flicker {
                        0% { opacity: 0.8; }
                        50% { opacity: 1; }
                        100% { opacity: 0.6; }
                    }
                `}</style>

                <div
                    ref={containerRef}
                    className="relative w-full max-w-4xl h-[600px] bg-[#121217]/50 border border-[#2A1E16] mx-8 rounded-lg overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(198,161,91,0.25)_0,_transparent_55%)]" />

                    {/* Puzzle grid area — frame position is measured for alignment check */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div
                            ref={frameRef}
                            className="relative border border-[#C6A15B]/40 rounded-lg shadow-inner overflow-hidden bg-[#050608]"
                            style={{ width: GRID_SIZE, height: GRID_SIZE }}
                        >
                            {/* Faint full image in frame so player sees what they are assembling */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundImage: `url(${PUZZLE_IMAGE})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            />
                            {/* Grid lines over the target area */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-[#C6A15B]/20">
                                {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => (
                                    <div key={i} className="border border-[#C6A15B]/25" />
                                ))}
                            </div>
                        </div>
                        <p className="mt-4 text-[#9C9C9C] text-xs font-serif tracking-wider text-center pointer-events-auto">
                            Drag each fragment into the frame above until the broken image becomes whole.
                        </p>
                    </div>

                    {/* Geometric Lines when near completion */}
                    {correctCount >= 6 && !solved && frameOrigin && (
                        <svg className="absolute inset-0 pointer-events-none animate-pulse opacity-40 z-10 w-full h-full">
                            {pieces.map((p, i) => {
                                const tX = frameOrigin.x + p.col * CELL_SIZE;
                                const tY = frameOrigin.y + p.row * CELL_SIZE;
                                const isCorrect = Math.abs(p.x - tX) < ALIGN_TOLERANCE && Math.abs(p.y - tY) < ALIGN_TOLERANCE;
                                if (isCorrect && i > 0) {
                                    return (
                                        <line
                                            key={`l-${i}`}
                                            x1={p.x + CELL_SIZE / 2} y1={p.y + CELL_SIZE / 2}
                                            x2={pieces[0].x + CELL_SIZE / 2} y2={pieces[0].y + CELL_SIZE / 2}
                                            stroke="#B11226" strokeWidth="2" strokeDasharray="5,5"
                                        />
                                    );
                                }
                                return null;
                            })}
                        </svg>
                    )}

                    {/* Draggable pieces */}
                    <div className="absolute inset-0 pointer-events-none">
                        {pieces.map((piece) => (
                            <button
                                key={piece.id}
                                type="button"
                                className={`absolute rounded-sm border border-[#C6A15B]/30 shadow-lg cursor-move transition-transform duration-150 pointer-events-auto overflow-hidden
                                    ${draggingId === piece.id ? 'scale-105 z-40 ring-2 ring-[#C6A15B]/50' : 'z-20 hover:scale-[1.02]'}`}
                                style={getPieceStyle(piece)}
                                onMouseDown={(e) => handleMouseDown(e, piece.id)}
                            >
                                <span className="absolute bottom-0 right-0 p-1 bg-black/30 rounded-tl text-[#EDEDED]/40">
                                    <Move className="w-3 h-3" />
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Solved overlay and move to next room */}
            {showCode && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B0B0E]/90 backdrop-blur-sm z-40">
                    <div className="bg-[#1A120E] border-2 border-[#C6A15B] p-12 rounded-lg shadow-2xl text-center max-w-lg">
                        <h2 className="text-3xl font-serif text-[#EDEDED] mb-6 tracking-widest">
                            Image Restored
                        </h2>
                        <p className="text-[#9C9C9C] font-serif mb-6 leading-relaxed">
                            Every fragment falls into place. The pattern resolves into a single, undeniable
                            truth.
                        </p>
                        <div className="text-4xl font-serif text-[#C6A15B] tracking-wider mb-8 drop-shadow-[0_0_12px_rgba(198,161,91,0.6)]">
                            4.8
                        </div>
                        <button
                            onClick={() => changeRoom('clock')}
                            className="px-8 py-3 bg-[#6A0F1B] hover:bg-[#B11226] text-[#EDEDED] font-serif transition-colors duration-300 border border-[#C6A15B]/30"
                        >
                            Continue to Final Room
                        </button>
                    </div>
                </div>
            )}

            <HelpBar
                disabled={solved}
                onSkip={() => changeRoom('clock')}
                nextRoomLabel="Clock Room"
                answerContent={
                    <div>
                        <p className="text-[#9C9C9C] mb-4 text-sm">
                            Each square belongs somewhere inside the central 3×3 frame.
                        </p>
                        <p className="text-[#9C9C9C] mb-2 text-sm">
                            When every fragment is close to its matching position, the full image (and the
                            number 4.8) appears and the room will let you pass.
                        </p>
                    </div>
                }
            />

            <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none">
                <Inventory />
            </div>
        </div>
    );
}
