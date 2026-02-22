import { useState, useEffect } from 'react';
import { KeyRound } from 'lucide-react';
import { TopBar } from './TopBar';
import { HelpBar } from './HelpBar';
import { Inventory } from './Inventory';
import { useGame } from '../contexts/GameContext';
import RoomEffectController from '../effects/RoomEffectController';

export default function Room1Game({ onSolve }: { onSolve: () => void }) {
    const { changeRoom } = useGame();
    // Mastermind / Bulls and Cows Logic
    // We'll use a fixed but logical code to keep it completely predictable.
    const secretCode = '3814';

    const [guess, setGuess] = useState('');
    const [history, setHistory] = useState<{ attempt: string, exact: number, partial: number }[]>([]);
    const [solved, setSolved] = useState(false);
    const [error, setError] = useState(false);
    const [revealedHintIndex, setRevealedHintIndex] = useState(-1);
    const [hintMessage, setHintMessage] = useState<string | null>(null);

    const { gameState, consumeHint } = useGame();

    // Effects integration
    const [effects] = useState(() => new RoomEffectController('cipher'));
    const [maxExact, setMaxExact] = useState(0);
    const [signaturePlayed, setSignaturePlayed] = useState(false);
    const [entryPhase, setEntryPhase] = useState(0);

    useEffect(() => {
        if (gameState.solvedPuzzles.includes('mirror')) {
            setEntryPhase(5);
            setSignaturePlayed(true);
            return;
        }

        effects.triggerEntry();

        // Phase 1 - 0s
        setEntryPhase(1);

        // Phase 2 - Crack Formation (1.5s)
        const t1 = setTimeout(() => setEntryPhase(2), 1500);

        // Phase 3 - Wall Breaks Open (3s)
        const t2 = setTimeout(() => {
            setEntryPhase(3);
            effects.triggerSignatureEffect();
            setSignaturePlayed(true);
            const wallBreakAudio = new Audio('/MUSIC/wall break.mp3');
            wallBreakAudio.volume = 0.8;
            wallBreakAudio.play().catch(e => console.log('Audio error:', e));
        }, 3000);

        // Phase 4 - Dust Cloud Reveal (4s)
        const t3 = setTimeout(() => setEntryPhase(4), 4000);

        // Phase 5 - Fully Visible (5s)
        const t4 = setTimeout(() => {
            setEntryPhase(5);
        }, 5000);

        return () => {
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
            effects.triggerExit();
        };
    }, [effects, gameState.solvedPuzzles]);

    const VAULT_HINTS = [
        'The code is hidden in the text: "Three knocks... eight hours... one final witness... four suspects."',
        'Each word represents a digit in order: Three (3), Eight (8), One (1), Four (4).',
        'The full combination is 3814.',
    ];

    const handleRevealHint = () => {
        const used = consumeHint();
        if (used) {
            const next = revealedHintIndex + 1;
            setRevealedHintIndex(next);
            setHintMessage(VAULT_HINTS[Math.min(next, VAULT_HINTS.length - 1)]);
        }
    };

    useEffect(() => {
        if (gameState.solvedPuzzles.includes('mirror')) {
            setSolved(true);
        }
    }, [gameState.solvedPuzzles]);

    const checkGuess = () => {
        if (guess.length !== 4) {
            triggerError();
            return;
        }

        let exact = 0;
        let partial = 0;
        const secretArr: (string | null)[] = secretCode.split('');
        const guessArr: (string | null)[] = guess.split('');

        // Count exact matches
        guessArr.forEach((char, index) => {
            if (char === secretArr[index]) {
                exact++;
                secretArr[index] = null; // Mark as used
                guessArr[index] = null;  // Mark as used
            }
        });

        // Count partial matches
        guessArr.forEach((char) => {
            if (char !== null && secretArr.includes(char)) {
                partial++;
                secretArr[secretArr.indexOf(char)] = null; // Mark as used
            }
        });

        const newHistory = [{ attempt: guess, exact, partial }, ...history];
        setHistory(newHistory);
        setGuess('');

        if (exact > maxExact) {
            setMaxExact(exact);
            effects.triggerProgressEffect(exact / 4);
        } else if (exact === 0 && partial === 0) {
            effects.triggerErrorEffect();
        }

        if (exact === 4) {
            effects.triggerSolve();
            setSolved(true);
            setTimeout(() => onSolve(), 2000);
        }
    };

    const triggerError = () => {
        setError(true);
        setTimeout(() => setError(false), 500);
    };

    return (
        <div className="min-h-screen bg-[#0B0B0E] relative overflow-hidden font-serif">
            {entryPhase < 5 && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black pointer-events-auto">
                    {/* The background - pre-break wall */}
                    <div
                        className={`absolute inset-0 bg-[#3a3a3a] bg-[url('/images/wall.jpeg')] bg-cover bg-center transition-transform duration-[3000ms]
                        ${entryPhase === 1 ? 'animate-[subtleShake_1.5s_ease-in-out_infinite] scale-105' : ''}
                        ${entryPhase >= 3 ? 'scale-[1.15] opacity-0 transition-opacity duration-1000' : ''}
                        `}
                        style={{
                            transformOrigin: 'center center',
                            filter: entryPhase === 1 ? 'brightness(0.5)' : 'brightness(1)'
                        }}
                    >
                        {/* Phase 2 Cracks */}
                        {entryPhase >= 2 && entryPhase < 4 && (
                            <div className="absolute inset-0 pointer-events-none">
                                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <path d="M50 50 L45 30 L30 20 M50 50 L60 25 L80 15 M50 50 L35 70 M50 50 L65 80 L90 90"
                                        fill="none" stroke="#66eeff" strokeWidth="0.5" filter="url(#glow)"
                                        className="animate-[drawCrack_1.5s_ease-out_forwards]"
                                        style={{ strokeDasharray: 200, strokeDashoffset: 200 }}
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Fractured Fragments Phase 3+ */}
                    {entryPhase >= 3 && entryPhase < 5 && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-0 left-0 w-1/2 h-full bg-[url('/images/wall.jpeg')] bg-cover bg-left shadow-2xl animate-[slideLeft_1.5s_ease-in_forwards]" />
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-[url('/images/wall.jpeg')] bg-cover bg-right shadow-2xl animate-[slideRight_1.5s_ease-in_forwards]" />

                            {/* Glowing cipher symbols behind the wall */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center mix-blend-screen opacity-80 pointer-events-none">
                                <div className="absolute top-0 left-0 w-full h-[10vh] bg-red-600/30 animate-[scanBeam_3s_linear_1] z-10 opacity-0 relative" style={{ boxShadow: '0 0 40px red' }} />

                                <div className="text-[#00ffcc] text-4xl sm:text-7xl font-mono tracking-[1em] animate-[glitch_0.5s_infinite]">
                                    3814 1912
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Phase 4 - Dust Cloud */}
                    {entryPhase >= 3 && entryPhase < 5 && (
                        <div className={`absolute inset-0 bg-[#bbaaa0] mix-blend-screen opacity-0 pointer-events-none ${entryPhase === 4 ? 'animate-[fadeDust_1s_ease-out_forwards]' : 'animate-[dustBurst_0.5s_ease-out_forwards]'}`} />
                    )}

                    <style>{`
                        @keyframes subtleShake {
                            0%, 100% { transform: translate(0, 0) scale(1.05); }
                            25% { transform: translate(-2px, 2px) scale(1.05); }
                            50% { transform: translate(2px, -2px) scale(1.05); }
                            75% { transform: translate(-2px, -2px) scale(1.05); }
                        }
                        @keyframes drawCrack {
                            0% { stroke-dashoffset: 200; }
                            100% { stroke-dashoffset: 0; }
                        }
                        @keyframes slideLeft {
                            0% { transform: translateX(0) rotate(0deg); opacity: 1; filter: drop-shadow(10px 0 15px rgba(0,0,0,0.8)); }
                            100% { transform: translateX(-100%) rotate(-10deg); opacity: 0; }
                        }
                        @keyframes slideRight {
                            0% { transform: translateX(0) rotate(0deg); opacity: 1; filter: drop-shadow(-10px 0 15px rgba(0,0,0,0.8)); }
                            100% { transform: translateX(100%) rotate(10deg); opacity: 0; }
                        }
                        @keyframes dustBurst {
                            0% { opacity: 0; transform: scale(0.8); }
                            100% { opacity: 0.8; transform: scale(1.2); }
                        }
                        @keyframes fadeDust {
                            0% { opacity: 0.8; }
                            100% { opacity: 0; }
                        }
                        @keyframes scanBeam {
                            0% { top: -10vh; opacity: 1; }
                            90% { top: 110vh; opacity: 1; }
                            100% { top: 110vh; opacity: 0; }
                        }
                        @keyframes glitch {
                            0%, 100% { opacity: 1; transform: skewX(0); filter: hue-rotate(0deg); }
                            20% { opacity: 0.8; transform: skewX(-10deg); filter: hue-rotate(90deg); }
                            40% { opacity: 0.9; transform: skewX(10deg); }
                            60% { opacity: 1; filter: invert(0.2); }
                            80% { opacity: 0.5; transform: scale(1.05); }
                        }
                    `}</style>
                </div>
            )}

            <TopBar roomTitle="Vault Access" />

            {/* Clue strip */}
            <div className="absolute top-20 left-0 right-0 z-10 px-6 flex justify-center">
                <div className="w-full max-w-2xl bg-[#1A120E]/95 backdrop-blur-sm border border-[#C6A15B]/20 rounded-lg shadow-xl px-5 py-3 text-center">
                    <div className="text-[10px] text-[#C6A15B] font-semibold tracking-widest uppercase mb-1">Clue</div>
                    <p className="text-[#EDEDED] font-serif text-sm leading-snug whitespace-pre-line">
                        Decryption required. Solve the kinetic signature: (1271 × 3) + 1.
                    </p>
                </div>
            </div>

            {/* Ambient Animated Background */}
            <div className="absolute inset-0 pointer-events-none filter blur-[1px] opacity-10">
                <div className="absolute inset-0 data-stream bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHRleHQgeD0iMTAiIHk9IjMwIiBmaWxsPSIjNGE0YTRhIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjEyIj4wIDEgMCAxIDE8L3RleHQ+PC9zdmc+')] [background-size:60px_60px] animate-[slide_20s_linear_infinite_reverse]" />
            </div>
            {/* Ambient Rotating Wheels */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
                <div className="absolute border border-white/20 rounded-full w-[800px] h-[800px] top-[-200px] left-[-200px] animate-[spin_40s_linear_infinite]" />
                <div className="absolute border-[10px] border-dashed border-white/10 rounded-full w-[600px] h-[600px] top-[-100px] left-[-100px] animate-[spin_30s_linear_infinite_reverse]" />
                <div className="absolute border-[40px] border-double border-white/10 rounded-full w-[1000px] h-[1000px] bottom-[-400px] right-[-400px] animate-[spin_50s_linear_infinite]" />
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0B0B0E_80%)]" />
                <div className="absolute inset-0 scanline opacity-[0.15]" />
            </div>

            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                display: 'flex', gap: '3rem', alignItems: 'flex-start',
                pointerEvents: 'auto', zIndex: 5
            }}>

                {/* Terminal Input */}
                <div className="glass-panel relative overflow-hidden" style={{
                    background: 'linear-gradient(135deg, rgba(20,20,25,0.98) 0%, rgba(10,10,15,0.98) 100%)',
                    border: solved ? '2px solid #22c55e' : '2px solid #b11226',
                    padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '420px',
                    boxShadow: solved ? '0 0 50px rgba(34, 197, 94, 0.4)' : '0 0 50px rgba(177, 18, 38, 0.4)',
                    backdropFilter: 'blur(16px)'
                }}>
                    <KeyRound size={48} color={solved ? 'var(--clr-bg-success)' : 'var(--clr-accent-gold)'} style={{ marginBottom: '1.5rem', filter: solved ? 'drop-shadow(0 0 10px rgba(34,197,94,0.6))' : 'drop-shadow(0 0 10px rgba(198,161,91,0.4))' }} />
                    <h2 className="mono-font" style={{ color: solved ? '#22c55e' : '#b11226', letterSpacing: '6px', textAlign: 'center', margin: '0 0 1rem 0', textShadow: solved ? '0 0 15px rgba(34,197,94,0.5)' : '0 0 15px rgba(177,18,38,0.5)', fontWeight: 'bold' }}>
                        VAULT ACCESS
                    </h2>
                    <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                        Access requires a 4-digit code. Forensic feedback active. <br /><br />
                        <span className="bg-[#22c55e]/10 text-[#22c55e] px-2 py-1 rounded border border-[#22c55e]/30 mr-2">🟢 EXACT: Right digit & spot</span><br className="mb-2" />
                        <span className="bg-[#c6a15b]/10 text-[#c6a15b] px-2 py-1 rounded border border-[#c6a15b]/30">🟡 PARTIAL: Right digit, wrong spot</span>
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'center', padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                            type="text"
                            maxLength={4}
                            value={guess}
                            disabled={solved}
                            onChange={(e) => setGuess(e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => e.key === 'Enter' && checkGuess()}
                            placeholder="0000"
                            className={`mono-font ${error ? 'error-shake' : ''}`}
                            style={{
                                width: '180px', height: '60px', fontSize: '2.5rem', letterSpacing: '12px', textAlign: 'center',
                                background: 'transparent', border: 'none',
                                color: solved ? '#22c55e' : '#EDEDED', outline: 'none',
                                paddingLeft: '12px' // Offset for letter-spacing to center it
                            }}
                        />
                        <button
                            className="bg-[#b11226] hover:bg-[#8b0e1d] text-white px-6 py-2 rounded font-bold tracking-widest transition-all disabled:opacity-30"
                            onClick={checkGuess}
                            disabled={solved || guess.length !== 4}
                        >
                            SUBMIT
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleRevealHint}
                        disabled={solved || gameState.hintsRemaining <= 0}
                        className="mt-6 px-6 py-2 bg-[#1A120E] hover:bg-[#2A2018] text-[#C6A15B] tracking-[0.2em] font-bold text-[10px] uppercase border border-[#C6A15B]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        💡 Hints ({gameState.hintsRemaining})
                    </button>
                    {hintMessage && (
                        <div className="mt-4 w-full p-3 bg-black/40 border border-[#C6A15B]/20 rounded text-center">
                            <p className="text-[#EDEDED] font-serif text-xs italic">💡 {hintMessage}</p>
                        </div>
                    )}
                </div>

                {/* Terminal Output Log */}
                <div className="glass-panel mono-font relative overflow-hidden" style={{
                    width: '400px', height: '480px', background: 'linear-gradient(180deg, rgba(15,15,20,0.95) 0%, rgba(5,5,8,0.95) 100%)',
                    border: '1px solid rgba(198, 161, 91, 0.2)', padding: '1.5rem',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: 'inset 0 0 30px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(12px)'
                }}>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c6a15b]/30 to-transparent opacity-50"></div>

                    <h3 style={{ color: 'var(--clr-accent-gold)', borderBottom: '1px solid rgba(198,161,91,0.2)', paddingBottom: '0.75rem', margin: '0 0 1rem 0', letterSpacing: '2px', fontSize: '1.1rem', textShadow: '0 0 5px rgba(198,161,91,0.5)' }}>
                        <span className="animate-pulse mr-2">█</span> DECRYPTION LOG
                    </h3>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
                        {history.length === 0 && <div style={{ color: 'var(--clr-text-muted)', opacity: 0.5, fontStyle: 'italic' }}>Awaiting input stream...</div>}

                        {history.map((h, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '6px',
                                borderLeft: h.exact === 4 ? '3px solid var(--clr-bg-success)' : '3px solid rgba(198,161,91,0.3)',
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
                            }}>
                                <span style={{ fontSize: '1.5rem', letterSpacing: '4px' }}>{h.attempt}</span>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {/* Render exact matches */}
                                    {[...Array(h.exact)].map((_, j) => (
                                        <div key={`e-${j}`} style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--clr-bg-success)' }}></div>
                                    ))}
                                    {/* Render partial matches */}
                                    {[...Array(h.partial)].map((_, j) => (
                                        <div key={`p-${j}`} style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--clr-accent-gold)' }}></div>
                                    ))}
                                    {/* Render misses */}
                                    {[...Array(4 - h.exact - h.partial)].map((_, j) => (
                                        <div key={`m-${j}`} style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid var(--clr-text-muted)' }}></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {solved && (
                        <div style={{ color: 'var(--clr-bg-success)', textAlign: 'center', marginTop: '1rem', animation: 'pulse 1s infinite' }}>
                            OVERRIDE ACCEPTED
                        </div>
                    )}
                </div>

            </div>

            <HelpBar
                disabled={solved}
                onSkip={() => changeRoom('piano')}
                nextRoomLabel="Piano Room"
                answerContent={
                    <div className="space-y-4">
                        <h4 className="text-[#C6A15B] font-bold">THE VAULT CODE:</h4>
                        <p className="text-sm text-[#9C9C9C]">Mastermind puzzle answer is exactly 3814.</p>
                        <div className="pt-4 border-t border-[#C6A15B]/20 text-center">
                            <p className="text-xs mb-1 uppercase tracking-widest">Final Vault Code:</p>
                            <p className="text-2xl text-[#C6A15B] font-bold">3814</p>
                        </div>
                    </div>
                }
            />

            <div className="absolute bottom-48 left-0 right-0 flex justify-center pointer-events-none">
                <Inventory />
            </div>

            <style>{`
                .glass-panel {
                    backdrop-filter: blur(8px);
                    border-radius: 12px;
                }
                .mono-font {
                    font-family: monospace;
                }
                .btn-primary {
                    background: var(--clr-bg-success);
                    color: black;
                    font-weight: bold;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-primary:hover:not(:disabled) {
                    filter: brightness(1.2);
                    box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
                }
                .btn-primary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .error-shake { animation: horizontal-shaking 0.3s forwards; }
                @keyframes horizontal-shaking {
                    0% { transform: translateX(0) }
                    25% { transform: translateX(5px) }
                    50% { transform: translateX(-5px) }
                    75% { transform: translateX(5px) }
                    100% { transform: translateX(0) }
                }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
                @keyframes slide {
                    0% { background-position: 0 0; }
                    100% { background-position: 60px 60px; }
                }
                .scanline {
                    background: linear-gradient(to bottom, transparent 50%, rgba(198, 161, 91, 0.1) 51%);
                    background-size: 100% 4px;
                    animation: scan 10s linear infinite;
                }
                @keyframes scan {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 100vh; }
                }
            `}</style>
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Wall Crack and Marking */}
                <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-40">
                    {/* Hidden Marking */}
                    <div
                        className="absolute text-[8rem] font-serif text-[#111] rotate-12 select-none mix-blend-multiply transition-opacity duration-[3000ms]"
                        style={{
                            opacity: signaturePlayed ? 0.05 + (maxExact * 0.1) : 0,
                            textShadow: '0 0 10px rgba(0,0,0,0.5)'
                        }}
                    >
                        3 8 1 4
                    </div>

                    {/* CSS/SVG Crack */}
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="opacity-80" style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}>
                        <path
                            d="M 50 0 L 48 20 L 51 35 L 47 50 L 52 65 L 48 80 L 50 100"
                            fill="none"
                            stroke="#030303"
                            strokeWidth="0.3"
                            strokeDasharray="200"
                            strokeDashoffset={signaturePlayed ? (solved ? 0 : 200 - 20 - (maxExact * 35)) : 200}
                            style={{
                                transition: solved ? 'stroke-dashoffset 0.1s ease-out' : 'stroke-dashoffset 2s ease-in-out',
                            }}
                        />
                        {solved && (
                            <path
                                d="M 50 0 Q 48 20 48 40 Q 52 60 48 80 Q 50 100 50 100"
                                fill="none"
                                stroke="#000"
                                strokeWidth="2"
                                style={{ filter: 'blur(2px)' }}
                            />
                        )}
                    </svg>
                </div>

                <div className="absolute top-0 left-0 w-64 h-64 bg-[#6A0F1B]/10 blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B11226]/10 blur-3xl animate-pulse delay-1000" />
            </div>
        </div>
    );
}
