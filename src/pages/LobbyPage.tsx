import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Loader, Copy, Check, Users } from 'lucide-react';

export default function LobbyPage() {
    const navigate = useNavigate();
    const { createTeam, joinTeam, joinMatchmaking, players, teamCode, difficulty, startGame, isMultiplayer, gameState, myId, username, setShowBriefing, error } = useGame();

    const [playerName, setPlayerName] = useState(username || '');
    const [roomCodeToJoin, setRoomCodeToJoin] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('normal');
    // Tab state: 'create' | 'join' | 'matchmaking'
    const [menuTab, setMenuTab] = useState<'create' | 'join' | 'matchmaking'>('create');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isWaitingForStart, setIsWaitingForStart] = useState(false);
    const [playerReadyState, setPlayerReadyState] = useState<Record<string, boolean>>({});
    const [codeCopied, setCodeCopied] = useState(false);

    useEffect(() => {
        if (error) {
            setErrorMsg(error);
        }
    }, [error]);

    useEffect(() => {
        if (gameState.currentRoom !== 'menu') {
            navigate('/play');
        }
    }, [gameState.currentRoom, navigate]);

    useEffect(() => {
        // Update player ready state based on players list
        const readyMap: Record<string, boolean> = {};
        players.forEach(p => {
            readyMap[p.id] = p.ready || false;
        });
        setPlayerReadyState(readyMap);
    }, [players]);

    const handleCreateRoom = async () => {
        if (!playerName) return setErrorMsg('Name is required');
        setIsLoading(true);
        setErrorMsg('');
        try {
            await createTeam(playerName, selectedDifficulty);
        } catch (e: any) {
            setErrorMsg(e.message || 'Failed to create room.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMatchmaking = () => {
        if (!playerName) return setErrorMsg('Name is required');
        setIsLoading(true);
        setErrorMsg('');
        joinMatchmaking(playerName);
        // Error / success handled via context 'error' passing
    };

    const handleJoinRoom = async () => {
        if (!playerName) return setErrorMsg('Name is required');
        if (!roomCodeToJoin) return setErrorMsg('Room Code is required');
        setIsLoading(true);
        setErrorMsg('');
        try {
            const success = await joinTeam(roomCodeToJoin, playerName);
            if (!success) setErrorMsg('Failed to join room or room not found');
        } catch (e: any) {
            setErrorMsg(e.message || 'Failed to join room.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartGame = () => {
        setShowBriefing(true);
        setIsWaitingForStart(true);
        startGame();
    };

    const handlePlayerReady = () => {
        setIsWaitingForStart(true);
        startGame();
    };

    const handleCopyCode = () => {
        if (teamCode) {
            navigator.clipboard.writeText(teamCode);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    };

    const availableSlots = Math.max(0, 4 - players.length);

    if (isMultiplayer && teamCode) {
        // In Lobby
        return (
            <div className="min-h-screen bg-[#0B0B0E] text-[#EDEDED] font-serif p-12 flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-4 tracking-tighter text-[#B11226]">MULTIPLAYER LOBBY</h1>

                {/* ── INVITE INSTRUCTIONS ── */}
                <div className="bg-[#C6A15B]/10 border border-[#C6A15B]/30 p-6 max-w-2xl w-full mb-8 rounded">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-[#C6A15B]" />
                        <h3 className="text-xs font-bold tracking-[0.3em] text-[#C6A15B] uppercase">Add Teammates</h3>
                    </div>
                    <p className="text-sm text-[#C8C8C8] mb-4">
                        Share the team code below with your teammates so they can join your mission. Up to 4 agents total.
                    </p>
                    <div className="bg-black/50 p-4 rounded border border-[#C6A15B]/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                            <span className="text-[10px] text-[#C6A15B] uppercase tracking-widest font-bold">Team Code:</span>
                            <span className="text-2xl font-mono font-bold text-white tracking-widest">{teamCode}</span>
                        </div>
                        <button
                            onClick={handleCopyCode}
                            className="ml-4 flex items-center gap-2 px-4 py-2 bg-[#C6A15B]/20 hover:bg-[#C6A15B]/30 border border-[#C6A15B]/50 text-[#C6A15B] rounded transition-all"
                        >
                            {codeCopied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    COPIED
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    COPY
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-[#141419] border border-white/5 p-8 max-w-2xl w-full text-center mb-8">
                    <h2 className="text-xl text-[#C6A15B] tracking-widest mb-4">TEAM AGENTS</h2>
                    <div className="text-4xl font-bold text-white mb-2">{players.length} / 4</div>
                    <div className={`text-sm tracking-widest ${availableSlots > 0 ? 'text-green-400' : 'text-yellow-500'}`}>
                        {availableSlots} SLOT{availableSlots !== 1 ? 'S' : ''} AVAILABLE
                    </div>
                </div>

                {/* ── MISSION OBJECTIVE ── */}
                <div className="bg-[#B11226]/5 border border-[#B11226]/20 p-6 max-w-2xl w-full mb-8 rounded">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 bg-[#B11226] animate-pulse rounded-full" />
                        <h3 className="text-xs font-bold tracking-[0.3em] text-[#B11226] uppercase">Priority Objective</h3>
                    </div>
                    <p className="text-[#C8C8C8] font-serif text-sm italic leading-relaxed">
                        Agents must infiltrate the Ashford Estate and recover 5 key evidence fragments.
                        Solving forensic puzzles in sequential order will reveal the Estate Lawyer's location and confirm the homicide motive.
                    </p>
                    <div className="mt-4 pt-4 border-t border-[#B11226]/20 flex gap-4 text-xs font-mono">
                        <span className="text-white/50">THREAT LEVEL:</span>
                        <span className={`font-bold uppercase tracking-widest ${difficulty === 'hard' ? 'text-red-500' : difficulty === 'easy' ? 'text-green-500' : 'text-[#C6A15B]'}`}>
                            {difficulty}
                        </span>
                    </div>
                </div>

                <div className="bg-[#141419] border border-white/5 p-8 max-w-2xl w-full mb-8">
                    <h3 className="text-xl mb-6 tracking-widest border-b border-white/10 pb-4">TEAM AGENTS ({players.length})</h3>
                    <div className="space-y-4">
                        {players.map(p => {
                            return (
                                <div key={p.id} className="flex justify-between items-center bg-black/40 p-4 rounded">
                                    <div className="flex flex-col">
                                        <span className="text-xl">
                                            {p.name} {p.id === myId && "(You)"}
                                            {p.isHost && <span className="ml-3 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">HOST</span>}
                                        </span>
                                        {p.role && <span className="text-[10px] text-[#C6A15B] font-bold tracking-widest uppercase mt-1">CLASS: {p.role}</span>}
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-sm tracking-widest ${p.ready ? 'text-green-500' : 'text-[#C6A15B]'}`}>
                                            {p.ready ? 'READY' : 'JOINED'}
                                        </span>
                                        {p.puzzle && <span className="text-[10px] bg-[#B11226]/20 text-[#B11226] px-2 py-1 rounded font-bold uppercase tracking-widest">Assign: {p.puzzle}</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {players.find(p => p.id === myId)?.isHost ? (
                    <button
                        onClick={handleStartGame}
                        disabled={isWaitingForStart}
                        className="group relative px-12 py-5 bg-[#B11226] hover:bg-[#8B0E1D] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 text-lg font-bold tracking-[0.3em] flex items-center justify-center gap-3"
                    >
                        {isWaitingForStart && <Loader className="w-5 h-5 animate-spin" />}
                        <div className="absolute inset-0 border border-white/20 -m-1 group-hover:m-0 transition-all" />
                        {isWaitingForStart ? 'DEPLOYING...' : 'START INVESTIGATION'}
                    </button>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        {isWaitingForStart ? (
                            <div className="flex items-center gap-3 text-[#C6A15B] tracking-[0.2em] font-bold">
                                <Loader className="w-5 h-5 animate-spin" />
                                AWAITING GAME START...
                            </div>
                        ) : (
                            <>
                                <div className="text-[#C6A15B] animate-pulse tracking-[0.2em] font-bold mb-2">
                                    HOST READY CHECK
                                </div>
                                <button
                                    onClick={handlePlayerReady}
                                    className="group relative px-12 py-5 bg-[#C6A15B] hover:bg-[#A68848] text-black transition-all duration-300 text-lg font-bold tracking-[0.3em]"
                                >
                                    <div className="absolute inset-0 border border-white/20 -m-1 group-hover:m-0 transition-all" />
                                    MARK READY
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Pre-Lobby Setup
    return (
        <div className="min-h-screen bg-[#0B0B0E] text-[#EDEDED] font-serif p-12 flex flex-col items-center justify-center">
            <div className="max-w-md w-full bg-[#141419] border border-[#B11226]/20 p-8">
                <h2 className="text-3xl font-bold text-center mb-6 tracking-tighter shadow-black drop-shadow-lg p-2">MULTIPLAYER OPERATIONS</h2>

                {errorMsg && <div className="bg-red-900/50 text-red-200 border border-red-500 p-2 text-center mb-4">{errorMsg}</div>}

                <input
                    className="w-full bg-black/50 border border-white/10 p-4 mb-6 outline-none focus:border-[#C6A15B]"
                    placeholder="AGENT NAME"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                />

                <div className="flex justify-center mb-6 space-x-4 border-b border-white/10 pb-2">
                    <button
                        className={`px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors ${menuTab === 'create' ? 'text-[#C6A15B]' : 'text-gray-500 hover:text-white'}`}
                        onClick={() => setMenuTab('create')}
                    >
                        CREATE
                    </button>
                    <button
                        className={`px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors ${menuTab === 'join' ? 'text-[#C6A15B]' : 'text-gray-500 hover:text-white'}`}
                        onClick={() => setMenuTab('join')}
                    >
                        JOIN
                    </button>
                    <button
                        className={`px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors flex items-center gap-2 ${menuTab === 'matchmaking' ? 'text-blue-400' : 'text-gray-500 hover:text-blue-200'}`}
                        onClick={() => setMenuTab('matchmaking')}
                    >
                        <div className={`w-2 h-2 rounded-full ${menuTab === 'matchmaking' ? 'bg-blue-500 animate-pulse' : 'bg-transparent'}`} />
                        AUTO_MATCH
                    </button>
                </div>

                {menuTab === 'create' && (
                    <div className="space-y-4">
                        <div className="bg-black/30 border border-white/5 p-4 rounded mb-4">
                            <label className="text-[10px] text-[#C6A15B] tracking-widest uppercase font-bold mb-2 block">SELECT THREAT LEVEL</label>
                            <div className="flex gap-2 text-xs">
                                {['easy', 'normal', 'hard'].map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => setSelectedDifficulty(diff)}
                                        className={`flex-1 py-2 uppercase tracking-widest font-mono transition-colors ${selectedDifficulty === diff ? (diff === 'hard' ? 'bg-red-900/40 border-red-500 text-red-400' : diff === 'easy' ? 'bg-green-900/40 border-green-500 text-green-400' : 'bg-[#C6A15B]/20 border-[#C6A15B] text-[#C6A15B]') : 'bg-transparent border-white/10 text-white/50 hover:bg-white/5'} border rounded`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleCreateRoom}
                            disabled={isLoading}
                            className="w-full relative px-6 py-4 bg-[#B11226] hover:bg-[#8B0E1D] transition-all duration-300 text-lg font-bold tracking-[0.3em] disabled:opacity-50"
                        >
                            {isLoading ? 'INITIATING...' : 'CREATE ROOM'}
                        </button>
                    </div>
                )}

                {menuTab === 'join' && (
                    <div className="space-y-4">
                        <input
                            className="w-full bg-black/50 border border-white/10 p-4 outline-none focus:border-[#C6A15B] text-center tracking-widest font-mono"
                            placeholder="ENTER ROOM CODE"
                            maxLength={6}
                            value={roomCodeToJoin}
                            onChange={e => setRoomCodeToJoin(e.target.value)}
                            autoComplete="off"
                            spellCheck="false"
                        />
                        <button
                            onClick={handleJoinRoom}
                            disabled={isLoading}
                            className="w-full relative px-6 py-4 bg-[#C6A15B] hover:bg-[#A68848] text-black transition-all duration-300 text-lg font-bold tracking-[0.3em] disabled:opacity-50"
                        >
                            {isLoading ? 'JOINING...' : 'JOIN ROOM'}
                        </button>
                    </div>
                )}

                {menuTab === 'matchmaking' && (
                    <div className="space-y-4">
                        <div className="text-center text-sm font-mono text-white/60 mb-4 px-4 leading-relaxed">
                            Deploying as a solo operative.
                            The agency will find 3 additional field agents and auto-construct an encrypted session.
                        </div>
                        <button
                            onClick={handleMatchmaking}
                            disabled={isLoading}
                            className="w-full relative px-6 py-4 bg-transparent border-2 border-[#1E3A8A] text-blue-400 hover:bg-blue-900/20 transition-all duration-300 text-lg font-bold tracking-[0.3em] disabled:opacity-50"
                        >
                            {isLoading ? 'SCANNING NETWORK...' : 'FIND MATCH'}
                        </button>
                    </div>
                )}
                <button
                    onClick={() => navigate('/')}
                    className="w-full mt-6 py-3 border border-white/20 hover:bg-white/5 transition-all text-sm tracking-widest text-[#9C9C9C]"
                >
                    BACK TO MAIN MENU
                </button>
            </div>
        </div>
    );
}
