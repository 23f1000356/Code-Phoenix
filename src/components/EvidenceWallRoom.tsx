import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpBar } from './HelpBar';
import { useGame } from '../contexts/GameContext';
import { Pin, Link2, Search, Crosshair, AlertTriangle } from 'lucide-react';
import RoomEffectController from '../effects/RoomEffectController';

const EVIDENCE_NODES = [
    { id: 'ledger', label: 'Ledger 2735', info: 'Shows systematic embezzlement from trust accounts.', position: { x: 200, y: 150 } },
    { id: 'piano', label: 'Melody 1912', info: 'Founding year of the Ashford trust, eliza was born this year.', position: { x: 600, y: 150 } },
    { id: 'clock', label: 'Time 3:05', info: 'The watch was smashed during a struggle at exactly 3:05 AM.', position: { x: 200, y: 450 } },
    { id: 'victim', label: 'Age 27', info: 'Eliza died at 27. Same as the ledger prefix.', position: { x: 600, y: 450 } },
    { id: 'lawyer', label: 'The Lawyer', info: 'The sole executor of the Ashford Trust.', position: { x: 400, y: 300 } },
];

export function EvidenceWallRoom() {
    const { gameState, solvePuzzle, changeRoom, setDecision } = useGame();
    const [connections, setConnections] = useState<{ from: string, to: string }[]>([]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [solved, setSolved] = useState(false);
    const [showFinale, setShowFinale] = useState(false);
    const [revealedHintIndex, setRevealedHintIndex] = useState(-1);
    const [hintMessage, setHintMessage] = useState<string | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    const [effects] = useState(() => new RoomEffectController('wall'));
    const [bloodDrip, setBloodDrip] = useState(0); // Progress tracking
    const [connectionMade, setConnectionMade] = useState(false);
    const [firstDrip, setFirstDrip] = useState(false);
    const [wrongDrips, setWrongDrips] = useState<{ id: number, x: number, y: number }[]>([]);

    const playWaterSound = () => {
        const audio = new Audio('/MUSIC/water.mp3');
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio err', e));
    };

    useEffect(() => {
        effects.triggerEntry();
        setTimeout(() => effects.triggerSignatureEffect(), 1500);

        // Phase 2: First Blood Appearance
        const t1 = setTimeout(() => {
            setFirstDrip(true);
            playWaterSound();
        }, 5000);

        return () => {
            clearTimeout(t1);
            effects.triggerExit();
        };
    }, [effects]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (gameState.solvedPuzzles.includes('wall')) {
            setSolved(true);
            setShowFinale(true);
            setBloodDrip(100);
        }
    }, [gameState.solvedPuzzles]);

    const handleNodeClick = (id: string) => {
        if (solved) return;
        if (selectedNode === null) {
            setSelectedNode(id);
        } else if (selectedNode !== id) {
            const exists = connections.some(c =>
                (c.from === selectedNode && c.to === id) || (c.from === id && c.to === selectedNode)
            );
            if (!exists) {
                setConnections([...connections, { from: selectedNode, to: id }]);
                playWaterSound();

                // Mistake logic -> wrong drip spawns
                if (id !== 'lawyer' && selectedNode !== 'lawyer') {
                    const node = EVIDENCE_NODES.find(n => n.id === id);
                    if (node) {
                        setWrongDrips(prev => [...prev, { id: Date.now(), x: node.position.x, y: node.position.y }]);
                    }
                }
            }
            setSelectedNode(null);
        } else {
            setSelectedNode(null);
        }
    };

    useEffect(() => {
        if (solved) return;

        let accused = null;
        for (const node of EVIDENCE_NODES) {
            const links = connections.filter(c => c.from === node.id || c.to === node.id);
            if (links.length >= 4) {
                accused = node.id;
                break;
            }
        }

        if (connections.length > 0 && !connectionMade) {
            effects.triggerProgressEffect(connections.length / 4);
            setConnectionMade(true);
            setTimeout(() => setConnectionMade(false), 500);

            if (connections.length === 3) {
                setBloodDrip(30);
            }
        }

        if (accused && !solved) {
            setDecision('accused', accused);
            setDecision('missedCriticalClue', String(revealedHintIndex > -1));
            setSolved(true);
            setBloodDrip(100);
            playWaterSound();
            effects.triggerSolve();
            setTimeout(() => {
                setShowFinale(true);
                solvePuzzle('wall');
            }, 3500); // Extended slightly to let the final drip play out
        }
    }, [connections, connectionMade, effects, solvePuzzle, solved, setDecision, revealedHintIndex]);

    const { consumeHint } = useGame();
    const handleRevealHint = () => {
        const used = consumeHint();
        if (used) {
            const next = revealedHintIndex + 1;
            setRevealedHintIndex(next);
            const hints = [
                "The Estate Lawyer is at the center of everything.",
                "Draw connections from the Lawyer to the Ledger and the Trust Founding year.",
                "Link every piece of evidence to the Lawyer to reveal the final truth."
            ];
            setHintMessage(hints[Math.min(next, hints.length - 1)]);
        }
    };

    return (
        <div className="relative w-full h-screen bg-[#1A120E] overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url(/images/wall.jpeg)', backgroundSize: 'cover' }} />

            {/* Subtle Lamp Swing */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_top,rgba(198,161,91,0.1),transparent_60%)] origin-top animate-[lampSwing_6s_ease-in-out_infinite] z-20 pointer-events-none opacity-50" />

            {/* Blood Drip Overlay */}
            <div
                className="absolute top-0 left-0 right-0 bg-gradient-to-b from-[#6A0F1B] to-[#4A0A10] z-[90] pointer-events-none transition-all duration-[2000ms] ease-in-out opacity-80 mix-blend-multiply"
                style={{ height: `${bloodDrip}%` }}
            />

            {/* Evidence Board Area */}
            <div className="relative w-full h-full flex items-center justify-center p-20">
                <div className={`relative w-[1000px] h-[700px] bg-[#2A1E16] border-[12px] border-[#1A120E] shadow-2xl rounded-sm transition-transform duration-100 ${connectionMade ? 'scale-[1.01]' : ''}`}>

                    {/* Render Connections (Strings) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: bloodDrip > 0 ? 'drop-shadow(0 0 8px rgba(177,18,38,0.8))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                        {connections.map((c, i) => {
                            const from = EVIDENCE_NODES.find(n => n.id === c.from)!;
                            const to = EVIDENCE_NODES.find(n => n.id === c.to)!;
                            const isLawyer = c.from === 'lawyer' || c.to === 'lawyer';
                            return (
                                <g key={i}>
                                    <line
                                        x1={from.position.x} y1={from.position.y}
                                        x2={to.position.x} y2={to.position.y}
                                        stroke={isLawyer ? "#B11226" : "#A68848"}
                                        strokeWidth="3"
                                        strokeDasharray="5,3"
                                        className="animate-pulse"
                                    />
                                    {/* Blood tracing red lines */}
                                    {isLawyer && (
                                        <line
                                            x1={to.id === 'lawyer' ? from.position.x : to.position.x}
                                            y1={to.id === 'lawyer' ? from.position.y : to.position.y}
                                            x2={from.id === 'lawyer' ? from.position.x : to.position.x}
                                            y2={from.id === 'lawyer' ? from.position.y : to.position.y}
                                            stroke="#6A0F1B" strokeWidth="4" opacity="0.7"
                                            className="animate-[bloodTraceLine_2s_ease-in_forwards]"
                                            strokeDasharray="1000" strokeDashoffset="1000"
                                            style={{ filter: 'drop-shadow(0 2px 4px rgba(106,15,27,0.8))' }}
                                        />
                                    )}
                                </g>
                            );
                        })}
                        {selectedNode && (
                            <line
                                x1={EVIDENCE_NODES.find(n => n.id === selectedNode)!.position.x}
                                y1={EVIDENCE_NODES.find(n => n.id === selectedNode)!.position.y}
                                x2={mousePos.x - (window.innerWidth / 2 - 500)} // Adjust for center board
                                y2={mousePos.y - (window.innerHeight / 2 - 350)} // Adjust for center board
                                stroke="#B11226" strokeWidth="2" opacity="0.5"
                                strokeDasharray="5,3"
                            />
                        )}

                        {/* First Initial Blood Drip */}
                        {firstDrip && !solved && (
                            <path d="M 500,0 Q 500,100 500,150" stroke="#6A0F1B" strokeWidth="4" fill="none" opacity="0.8" className="animate-[bloodTraceLine_2s_ease-in_forwards]" strokeDasharray="200" strokeDashoffset="200" style={{ filter: 'drop-shadow(0 2px 4px rgba(106,15,27,0.8))' }} />
                        )}

                        {/* Dynamic Error Drop Splashes */}
                        {wrongDrips.map((drip) => (
                            <g key={drip.id}>
                                <path d={`M ${drip.x},${drip.y - 100} L ${drip.x},${drip.y}`} stroke="#6A0F1B" strokeWidth="5" fill="none" opacity="0.8" className="animate-[waterDrop_0.5s_ease-in_forwards]" strokeDasharray="100" strokeDashoffset="100" />
                                <circle cx={drip.x} cy={drip.y} r="15" fill="#6A0F1B" opacity="0" className="animate-[bloodSplash_2s_ease-out_0.5s_forwards]" style={{ mixBlendMode: 'multiply' }} />
                                <path d={`M ${drip.x},${drip.y} Q ${drip.x},${drip.y + 50} ${drip.x - 10},${drip.y + 100}`} stroke="#6A0F1B" strokeWidth="3" fill="none" opacity="0" className="animate-[bloodFlowDown_3s_ease-out_0.6s_forwards]" strokeDasharray="200" strokeDashoffset="200" />
                            </g>
                        ))}

                        {/* FINAL PAYOFF - Dramatic Hidden Document Outline Reveal */}
                        {solved && (
                            <g style={{ filter: 'drop-shadow(0 0 10px rgba(177,18,38,0.8))' }}>
                                {/* Center falling massive drop */}
                                <path d="M 500,0 L 500,200" stroke="#8B0E1D" strokeWidth="12" fill="none" strokeDasharray="200" strokeDashoffset="200" className="animate-[waterDrop_1s_ease-in_forwards]" />
                                {/* Splash outline forming the file */}
                                <path
                                    d="M 500,200 L 650,200 L 650,550 L 350,550 L 350,200 Z"
                                    stroke="#B11226" strokeWidth="6" fill="none"
                                    strokeDasharray="2000" strokeDashoffset="2000"
                                    className="animate-[bloodTraceLine_2s_ease-out_1s_forwards]"
                                    opacity="0.9"
                                />
                                {/* Hidden text reveal */}
                                <text x="500" y="380" fill="#B11226" fontSize="24" fontFamily="serif" textAnchor="middle" opacity="0" className="animate-[bloodTextFadeIn_2s_ease-in_2.5s_forwards]" letterSpacing="6">
                                    ASHFORD TRUST
                                </text>
                                <text x="500" y="420" fill="#6A0F1B" fontSize="16" fontFamily="monospace" textAnchor="middle" opacity="0" className="animate-[bloodTextFadeIn_2s_ease-in_3.5s_forwards]">
                                    CLASSIFIED HOMICIDE
                                </text>
                            </g>
                        )}
                    </svg>

                    {/* Render Evidence Nodes */}
                    {EVIDENCE_NODES.map(node => (
                        <div
                            key={node.id}
                            className={`absolute w-44 p-4 cursor-pointer transition-all duration-300 group ${selectedNode === node.id ? 'scale-110 z-30' : 'hover:scale-105 z-20'}`}
                            style={{
                                left: node.position.x, top: node.position.y,
                                transform: `translate(-50%, -50%) ${idxToRotation(node.id)}`
                            }}
                            onClick={() => handleNodeClick(node.id)}
                        >
                            <div className={`relative bg-[#F4EBD0] p-3 shadow-xl border-t-4 ${node.id === 'lawyer' ? 'border-[#B11226]' : 'border-black/10'} rounded-sm`}>
                                <Pin className={`absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 ${node.id === 'lawyer' ? 'text-[#B11226]' : 'text-[#333]'} drop-shadow-md`} />

                                {node.id === 'lawyer' ? (
                                    <div className="w-full h-24 bg-gray-400 mb-3 grayscale overflow-hidden relative">
                                        <div className="absolute inset-0 bg-[#000]/20" />
                                        <Search className="absolute inset-0 m-auto text-white/40 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center mb-2 border-b border-black/10 pb-1">
                                        <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">Exhibit {node.id.toUpperCase()}</span>
                                        <Link2 className="w-3 h-3 text-black/20" />
                                    </div>
                                )}

                                <h4 className="text-xs font-bold text-[#2A1E16] mb-1">{node.label}</h4>
                                <p className="text-[9px] text-[#2A1E16]/70 leading-tight italic line-clamp-2">"{node.info}"</p>
                            </div>
                        </div>
                    ))}

                    {/* Environmental Mood */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(0,0,0,0.6)_100%)] z-50" />
                </div>

                {/* Hints button + revealed hint */}
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                    <button
                        type="button"
                        onClick={handleRevealHint}
                        disabled={solved || gameState.hintsRemaining <= 0}
                        className="px-6 py-3 bg-[#1A120E] hover:bg-[#2A2018] text-[#C6A15B] tracking-[0.2em] font-bold text-xs uppercase border border-[#C6A15B]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        💡 Hints ({gameState.hintsRemaining})
                    </button>
                    {hintMessage && (
                        <div className="max-w-xl px-4 py-3 bg-[#1A120E]/95 border border-[#C6A15B]/30 rounded text-center">
                            <p className="text-[#EDEDED] font-serif text-sm">💡 {hintMessage}</p>
                        </div>
                    )}
                </div>
            </div>

            <HelpBar
                disabled={solved}
                onSkip={() => changeRoom('menu')}
                nextRoomLabel="Case Closed"
                answerContent={
                    <div className="space-y-3">
                        <p className="text-[#C6A15B] font-bold">THE CONVERGENCE:</p>
                        <p className="text-xs text-[#9C9C9C]">
                            Connect the <strong>Estate Lawyer</strong> to all other evidence:
                            Victim age (27), Trust (1912), Ledger (2735), and the True Time (3:05).
                        </p>
                        <p className="text-xs text-[#9C9C9C]">You need at least 5 strings to reveal the truth.</p>
                    </div>
                }
            />

            {/* Finale Overlay */}
            {showFinale && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#050508] z-[100] text-center p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,1)_60%)] pointer-events-none z-10 animate-fade-in" />
                    {/* Spotlight */}
                    <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[150%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.1),transparent_70%)] origin-top pointer-events-none z-10" />

                    <div className="max-w-2xl relative z-20 animate-fade-in">
                        <div className="flex justify-center mb-8 gap-12">
                            <Crosshair className="text-[#B11226] w-12 h-12 shadow-[0_0_20px_rgba(177,18,38,0.5)]" />
                            <AlertTriangle className="text-[#C6A15B] w-12 h-12" />
                        </div>

                        <h2 className="text-6xl text-[#EDEDED] font-bold mb-4 tracking-tighter uppercase">Case Closed</h2>
                        <div className="w-32 h-1 bg-[#B11226] mx-auto mb-12" />

                        <p className="text-xl text-[#9C9C9C] mb-8 leading-relaxed font-serif italic">
                            The red strings form a triangle pointing directly to the Lawyer...<br />
                            He forged the trust accounts. Eliza found out. He killed her at 3:05 AM and staged the ritual to hide a simple financial crime.
                        </p>

                        <div className="bg-[#1A120E] border border-[#C6A15B]/30 p-8 rounded mb-12">
                            <p className="text-[#C6A15B] text-sm tracking-[0.4em] uppercase mb-4 font-bold">Official Resolution</p>
                            <h3 className="text-3xl text-[#EDEDED] font-serif mb-2">Confirmed Homicide</h3>
                            <p className="text-[#9C9C9C] text-xs">Perpetrator: Estate Lawyer | Motive: Financial Embezzlement</p>
                        </div>

                        <div className="flex flex-col gap-6 items-center">
                            <div className="text-[#C6A15B] text-sm animate-pulse italic">“Truth survives.”</div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => navigate('/leaderboard')}
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-xs font-bold tracking-[0.3em] transition-all border border-white/10 uppercase"
                                >
                                    Leaderboard
                                </button>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white text-xs font-bold tracking-[0.3em] transition-all border border-white/10 uppercase"
                                >
                                    Profile
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-8 py-4 bg-[#B11226] hover:bg-[#8B0E1D] text-white text-xs font-bold tracking-[0.3em] transition-all border border-white/10 uppercase"
                                >
                                    End Investigation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Audio/Visual Payoff Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes idxRotate {
          0% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
          100% { transform: rotate(-2deg); }
        }
        @keyframes lampSwing {
          0%, 100% { transform: translateX(-50%) rotate(5deg); }
          50% { transform: translateX(-50%) rotate(-5deg); }
        }
        @keyframes bloodTraceLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes waterDrop {
          0% { stroke-dashoffset: 100; stroke-dasharray: 0, 100; }
          50% { stroke-dashoffset: 0; stroke-dasharray: 100, 100; }
          100% { stroke-dashoffset: -100; stroke-dasharray: 0, 100; }
        }
        @keyframes bloodSplash {
          0% { transform: scale(0.2); opacity: 0; }
          10% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0.5; }
        }
        @keyframes bloodFlowDown {
          0% { stroke-dashoffset: 200; opacity: 0.8; }
          100% { stroke-dashoffset: 0; opacity: 0.4; }
        }
        @keyframes bloodTextFadeIn {
          from { opacity: 0; filter: blur(4px); transform: translateY(-10px); }
          to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }
      `}} />
        </div>
    );
}

function idxToRotation(id: string) {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `rotate(${(hash % 6) - 3}deg)`;
}
