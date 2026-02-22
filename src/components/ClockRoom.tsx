import { useState, useRef, useEffect } from 'react';
import { TopBar } from './TopBar';
import { HelpBar } from './HelpBar';
import { useGame } from '../contexts/GameContext';
import RoomEffectController from '../effects/RoomEffectController';

const SOLUTION_HOUR = 3;
const SOLUTION_MINUTE = 5;

const LADY_IMAGE = '/images/lady.jpeg';

const CLOCK_HINTS = [
    'The hour is her age divided by 9. Eliza was 27.',
    '27 ÷ 9 = 3 — so set the hour hand to 3.',
    'The minute is the number of wounds. Count the daggers in the portrait: 5. Set the clock to 3:05.',
];

export function ClockRoom() {
    const { gameState, solvePuzzle, addToInventory, changeRoom, consumeHint } = useGame();
    const [clockState, setClockState] = useState({ hour: 12, minute: 0 });
    const [draggingHand, setDraggingHand] = useState<'hour' | 'minute' | null>(null);
    const [solved, setSolved] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [candleFlicker, setCandleFlicker] = useState(false);
    const [wallGlow, setWallGlow] = useState(false);
    const [ladyImageError, setLadyImageError] = useState(false);
    const [revealedHintIndex, setRevealedHintIndex] = useState(-1);
    const [hintMessage, setHintMessage] = useState<string | null>(null);

    const [effects] = useState(() => new RoomEffectController('clock'));
    const [bloodSpread, setBloodSpread] = useState(0);

    useEffect(() => {
        effects.triggerEntry();
        setTimeout(() => {
            effects.triggerSignatureEffect();
            setBloodSpread(1);
        }, 1500);
        return () => effects.triggerExit();
    }, [effects]);

    useEffect(() => {
        if (gameState.solvedPuzzles.includes('clock')) {
            setSolved(true);
            setShowDrawer(true);
            setBloodSpread(1);
        }
    }, [gameState.solvedPuzzles]);

    const clockRef = useRef<HTMLDivElement>(null);

    const handleRevealHint = () => {
        const used = consumeHint();
        if (used) {
            const next = revealedHintIndex + 1;
            setRevealedHintIndex(next);
            setHintMessage(CLOCK_HINTS[Math.min(next, CLOCK_HINTS.length - 1)]);
        }
    };

    useEffect(() => {
        if (solved) return;
        const distanceToSolution = Math.abs(clockState.hour - SOLUTION_HOUR) + Math.abs(clockState.minute - SOLUTION_MINUTE);

        if (clockState.hour === SOLUTION_HOUR && clockState.minute !== SOLUTION_MINUTE) {
            setCandleFlicker(true);
            setTimeout(() => setCandleFlicker(false), 500);
        } else if (clockState.minute === SOLUTION_MINUTE && clockState.hour !== SOLUTION_HOUR) {
            setWallGlow(true);
            setTimeout(() => setWallGlow(false), 800);
        } else if (distanceToSolution > 0 && distanceToSolution < 5) {
            setCandleFlicker(true);
        } else {
            setCandleFlicker(false);
        }
    }, [clockState, solved]);

    const handleMouseDown = (hand: 'hour' | 'minute') => {
        if (solved) return;
        setDraggingHand(hand);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingHand || !clockRef.current || solved) return;

        const rect = clockRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const degrees = ((angle * 180) / Math.PI + 90 + 360) % 360;

        if (draggingHand === 'hour') {
            const hour = Math.round((degrees / 30) % 12) || 12;
            setClockState((prev) => ({ ...prev, hour }));
        } else {
            const minute = Math.round(degrees / 6) % 60;
            setClockState((prev) => ({ ...prev, minute }));
        }
    };

    const handleMouseUp = () => setDraggingHand(null);

    const checkTime = () => {
        if (solved) return;
        if (clockState.hour === SOLUTION_HOUR && clockState.minute === SOLUTION_MINUTE) {
            effects.triggerSolve();
            setSolved(true);
            setTimeout(() => {
                setShowDrawer(true);
                solvePuzzle('clock');
                addToInventory({ id: 'final-key', name: 'Final Key', icon: '🗝️' });
            }, 3000);
        }
    };

    const getHourRotation = () => (clockState.hour % 12) * 30 + clockState.minute * 0.5;
    const getMinuteRotation = () => clockState.minute * 6;

    return (
        <div
            className="min-h-screen bg-[#0B0B0E] relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <TopBar roomTitle="The Time They Died" />

            {/* Clue strip at top so it never overlaps clock or portrait */}
            <div className="absolute top-20 left-0 right-0 z-10 px-6 flex justify-center">
                <div className="w-full max-w-2xl bg-[#1A120E]/95 backdrop-blur-sm border border-[#C6A15B]/20 rounded-lg shadow-xl px-5 py-3 text-center">
                    <div className="text-[10px] text-[#C6A15B] font-semibold tracking-widest uppercase mb-1">Clue</div>
                    <p className="text-[#EDEDED] font-serif text-sm leading-snug whitespace-pre-line">
                        When the lady screamed, time froze. The hour was her age divided by 9. The minute was the dagger wounds she suffered. Set the clock to the exact time of the tragedy.
                    </p>
                </div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pt-44 pb-24 px-6">
                {/* Lady portrait — right side (uses image from /images folder) */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 w-56 flex-shrink-0 z-10">
                    <div className="bg-gradient-to-b from-[#2A1E16] to-[#1A120E] border-2 border-[#C6A15B]/40 rounded-lg overflow-hidden shadow-xl">
                        <div className="aspect-[3/4] relative bg-[#1A120E] flex items-center justify-center">
                            {!ladyImageError ? (
                                <img
                                    src={LADY_IMAGE}
                                    alt="Eliza Ashford"
                                    className="w-full h-full object-cover object-top"
                                    onError={() => setLadyImageError(true)}
                                />
                            ) : (
                                <span className="text-[#C6A15B]/60 text-5xl">👤</span>
                            )}
                        </div>
                        <div className="px-3 py-2 text-center border-t border-[#C6A15B]/20">
                            <p className="text-[#EDEDED] font-serif font-semibold text-sm">Eliza Ashford</p>
                            <p className="text-[#9C9C9C] text-xs">27 years</p>
                        </div>
                    </div>
                </div>

                {/* Clock + controls — centered */}
                <div className="relative flex flex-col items-center gap-8">
                    <style>{`
                        @keyframes swing {
                            0%, 100% { transform: translateX(-50%) rotate(10deg); }
                            50% { transform: translateX(-50%) rotate(-10deg); }
                        }
                    `}</style>
                    <div
                        ref={clockRef}
                        className="relative w-96 h-96 bg-gradient-to-br from-[#2A1E16] to-[#1A120E] rounded-full border-8 border-[#C6A15B]/30 shadow-2xl z-20"
                    >
                        <div className="absolute inset-8 rounded-full border-4 border-[#C6A15B]/20 bg-gradient-to-br from-[#1A120E] to-[#0B0B0E]">
                            {/* Hour numbers */}
                            {[...Array(12)].map((_, i) => {
                                const angle = (i * 30 - 90) * (Math.PI / 180);
                                const x = Math.cos(angle) * 140 + 160;
                                const y = Math.sin(angle) * 140 + 160;
                                return (
                                    <div
                                        key={i}
                                        className="absolute text-[#EDEDED] font-serif text-xl"
                                        style={{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%,-50%)' }}
                                    >
                                        {i === 0 ? 12 : i}
                                    </div>
                                );
                            })}

                            {/* Hour hand — shorter, thicker, gold (clearly visible) */}
                            <div
                                className="absolute top-1/2 left-1/2 origin-bottom cursor-grab active:cursor-grabbing z-[5]"
                                style={{
                                    width: '12px', height: '72px',
                                    marginLeft: '-6px', marginTop: '-72px',
                                    transform: `rotate(${getHourRotation()}deg)`,
                                }}
                                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown('hour'); }}
                            >
                                <div className="w-full h-full bg-gradient-to-t from-[#C6A15B] via-[#B8935F] to-[#FFE4B5] rounded-full shadow-lg border border-[#1A120E]/50" />
                            </div>

                            {/* Minute hand — longer, thinner, red (clearly visible) */}
                            <div
                                className="absolute top-1/2 left-1/2 origin-bottom cursor-grab active:cursor-grabbing z-10"
                                style={{
                                    width: '6px', height: '120px',
                                    marginLeft: '-3px', marginTop: '-120px',
                                    transform: `rotate(${getMinuteRotation()}deg)`,
                                }}
                                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown('minute'); }}
                            >
                                <div className="w-full h-full bg-gradient-to-t from-[#B11226] via-[#8B0E1D] to-[#EDEDED] rounded-full shadow-lg border border-[#1A120E]/30" />
                            </div>

                            {/* Center pin */}
                            <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-[#C6A15B] rounded-full -translate-x-1/2 -translate-y-1/2 border-2 border-[#1A120E] shadow-lg z-20" />
                        </div>

                        {/* Blood stain and line */}
                        <div className="absolute inset-0 pointer-events-none rounded-full overflow-hidden">
                            <div className="absolute top-0 right-[20%] w-24 h-24 bg-[#6A0F1B]/60 blur-[20px] rounded-full transition-opacity duration-[3000ms]" style={{ opacity: bloodSpread * 0.8 }} />
                            <svg className="absolute inset-0 w-full h-full mix-blend-multiply opacity-80" viewBox="0 0 100 100">
                                <path
                                    d="M 75 5 Q 65 30 55 50"
                                    fill="none"
                                    stroke="#4A0A10"
                                    strokeWidth="3"
                                    strokeDasharray="100"
                                    strokeDashoffset={100 - bloodSpread * 100}
                                    style={{ transition: 'stroke-dashoffset 4000ms ease-in-out', filter: 'blur(1px)' }}
                                />
                                <path
                                    d="M 75 5 Q 65 30 55 50"
                                    fill="none"
                                    stroke="#8B0E1D"
                                    strokeWidth="1.5"
                                    strokeDasharray="100"
                                    strokeDashoffset={100 - bloodSpread * 100}
                                    style={{ transition: 'stroke-dashoffset 4000ms ease-in-out' }}
                                />
                            </svg>
                        </div>

                        {/* Pendulum */}
                        <div className={`absolute top-[90%] left-1/2 -translate-x-1/2 w-3 h-40 bg-gradient-to-b from-[#C6A15B] to-[#B8935F] shadow-lg origin-top -z-10 ${solved ? '' : 'animate-[swing_2s_ease-in-out_infinite]'}`}>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-[#2A1E16] to-[#1A120E] border-4 border-[#C6A15B] shadow-2xl" />
                        </div>

                        {/* Key drawer */}
                        {showDrawer && (
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#2A1E16] border-2 border-[#C6A15B] rounded-t-lg shadow-2xl flex items-center justify-center animate-fade-in">
                                <span className="text-[#C6A15B] font-serif">🗝️ Final Key Found</span>
                            </div>
                        )}
                    </div>

                    {/* Time display + check + hints */}
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-[#9C9C9C] text-xs tracking-wide">Drag the <span className="text-[#C6A15B]">hour</span> and <span className="text-[#B11226]">minute</span> hands to set the time</p>
                        <div className="flex items-center gap-4 flex-wrap justify-center">
                            <div className="text-[#EDEDED] font-serif text-xl bg-[#1A120E] px-4 py-2 border border-[#C6A15B]/20 rounded">
                                {clockState.hour.toString().padStart(2, '0')}:{clockState.minute.toString().padStart(2, '0')}
                            </div>
                            <button
                                onClick={checkTime}
                                disabled={solved}
                                className="px-8 py-3 bg-[#6A0F1B] hover:bg-[#B11226] text-[#EDEDED] font-serif
                             transition-colors duration-300 border border-[#C6A15B]/30
                             disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Check Time
                            </button>
                            <button
                                type="button"
                                onClick={handleRevealHint}
                                disabled={solved || gameState.hintsRemaining <= 0}
                                className="px-6 py-3 bg-[#1A120E] hover:bg-[#2A2018] text-[#C6A15B] tracking-[0.2em] font-bold text-xs uppercase border border-[#C6A15B]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                💡 Hints ({gameState.hintsRemaining})
                            </button>
                        </div>
                        {hintMessage && (
                            <div className="mt-2 max-w-xl mx-auto px-4 py-3 bg-[#1A120E]/90 border border-[#C6A15B]/30 rounded text-center">
                                <p className="text-[#EDEDED] font-serif text-sm">💡 {hintMessage}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Candelabra */}
                <div
                    className={`absolute top-24 left-20 w-40 h-64 transition-all duration-1000
                     ${wallGlow ? 'drop-shadow-[0_0_40px_rgba(177,18,38,0.8)]' : ''}`}
                >
                    <div className="w-full h-full bg-gradient-to-b from-[#2A1E16] to-[#1A120E] border-4 border-[#1A120E] rounded-t-3xl relative">
                        <div className="absolute inset-x-4 bottom-4 h-32">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`absolute bottom-0 w-8 h-24 bg-gradient-to-t from-[#C6A15B] via-[#FFE4B5] to-transparent
                             rounded-full blur-sm animate-pulse
                             ${candleFlicker ? 'opacity-30' : 'opacity-100'}`}
                                    style={{ left: `${i * 25}%`, animationDelay: `${i * 0.3}s` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Final solved overlay */}
            {solved && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0B0B0E]/90 backdrop-blur-sm z-40 animate-fade-in">
                    <div className="bg-[#1A120E] border-2 border-[#C6A15B] p-12 rounded-lg shadow-2xl text-center max-w-md">
                        <h2 className="text-4xl font-serif text-[#EDEDED] mb-6">Time Stands Still</h2>
                        <p className="text-[#9C9C9C] font-serif mb-4">
                            3:05 — The moment Eliza Ashford's scream echoed through eternity…
                        </p>
                        <p className="text-[#C6A15B] font-serif text-2xl mb-8">Discrepancy Confirmed</p>
                        <button
                            onClick={() => changeRoom('wall')}
                            className="px-10 py-3 bg-[#B11226] text-[#EDEDED] font-serif hover:bg-[#8B0E1D] transition-all border border-[#C6A15B]/30"
                        >
                            Proceed to Evidence Wall
                        </button>
                    </div>
                </div>
            )}

            <HelpBar
                disabled={solved}
                onSkip={() => changeRoom('wall')}
                nextRoomLabel="Evidence Wall"
                answerContent={
                    <div>
                        <p className="text-[#9C9C9C] mb-5 text-sm leading-relaxed">
                            The clue says the hour is her <em>age divided by 9</em>,<br />
                            and the minute is the number of <em>wounds</em>.
                        </p>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-[#C6A15B]/10 pb-3">
                                <span className="text-[#9C9C9C]">Eliza's age</span>
                                <span className="text-[#EDEDED] font-bold">27 ÷ 9 = <span className="text-[#C6A15B]">3</span></span>
                            </div>
                            <div className="flex justify-between items-center border-b border-[#C6A15B]/10 pb-3">
                                <span className="text-[#9C9C9C]">Wounds (daggers)</span>
                                <span className="text-[#EDEDED] font-bold">= <span className="text-[#C6A15B]">5</span></span>
                            </div>
                        </div>
                        <div className="mt-5 text-center">
                            <p className="text-[#9C9C9C] text-xs mb-2">Set the clock to:</p>
                            <div className="text-4xl font-serif text-[#C6A15B] font-bold drop-shadow-[0_0_12px_rgba(198,161,91,0.5)]">
                                3 : 05
                            </div>
                        </div>
                    </div>
                }
            />

        </div>
    );
}
