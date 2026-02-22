import { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Users, User, LogIn } from 'lucide-react';

export function MenuScreen() {
    const { startGame, createTeam, joinTeam, leaveTeam, teamCode, isMultiplayer, players, myId, error } = useGame();

    const [uiState, setUiState] = useState<'main' | 'multiplayer' | 'join'>('main');
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleCreateTeam = async () => {
        setIsLoading(true);
        setLocalError(null);
        if (!playerName.trim()) {
            setLocalError('Name is required to create a room');
            setIsLoading(false);
            return;
        }
        try {
            const code = await createTeam(playerName.trim());
            if (!code) throw new Error(error || 'Failed to create team.');
        } catch (err: unknown) {
            setLocalError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!playerName.trim()) {
            setLocalError('Name is required to join a room');
            return;
        }
        if (!joinCodeInput.trim() || joinCodeInput.length !== 6) {
            setLocalError('Invalid room code format (must be 6 characters).');
            return;
        }

        setIsLoading(true);
        setLocalError(null);
        try {
            const success = await joinTeam(joinCodeInput, playerName.trim());
            if (!success) throw new Error(error || 'Could not find team.');
        } catch (err: unknown) {
            setLocalError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleLeave = () => {
        leaveTeam();
        setUiState('multiplayer');
        setLocalError(null);
    };

    const isHost = players.length > 0 && players[0].id === myId;

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-[#EDEDED] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Atmospheric background glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B11226]/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6A0F1B]/10 blur-[120px] rounded-full animate-pulse delay-700" />
            <div className="absolute inset-0 bg-[url('/images/pic.jpeg')] bg-cover bg-center opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0E]/60 via-transparent to-[#0B0B0E]" />

            <div className="relative z-10 text-center px-8 max-w-3xl">
                <div className="mb-4 text-[#B11226]/60 font-serif tracking-[0.4em] text-sm uppercase">
                    A Murder Mystery
                </div>
                <h1 className="text-8xl font-bold mb-4 tracking-tight font-serif" style={{ textShadow: '0 0 60px rgba(177,18,38,0.4)' }}>
                    CIPHER
                </h1>
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-[#C6A15B] to-transparent mx-auto mb-8" />

                {(error || localError) && (
                    <div className="bg-[#B11226]/20 border border-[#B11226]/50 text-[#EDEDED] px-4 py-3 rounded mb-8 shadow-[0_0_20px_rgba(177,18,38,0.2)]">
                        <p className="text-sm font-serif">⚠️ {error || localError}</p>
                    </div>
                )}

                {!isMultiplayer && uiState === 'main' && (
                    <div className="flex flex-col items-center gap-6 animate-fade-in">
                        <p className="text-[#9C9C9C] font-serif italic text-lg mb-8 leading-relaxed max-w-lg">
                            Eliza Ashford is dead. The official report says suicide.<br />
                            The truth is buried in her mansion. You have 15 minutes.
                        </p>

                        <button onClick={startGame} className="w-80 flex items-center justify-center gap-3 px-8 py-5 bg-[#1A120E]/80 hover:bg-[#2A1E16] text-[#EDEDED] font-serif text-lg tracking-widest transition-all duration-300 border border-[#C6A15B]/30 hover:border-[#C6A15B]/80 hover:shadow-[0_0_30px_rgba(198,161,91,0.2)]">
                            <User className="w-5 h-5 text-[#C6A15B]" /> SINGLE PLAYER
                        </button>

                        <button onClick={() => setUiState('multiplayer')} className="w-80 flex items-center justify-center gap-3 px-8 py-5 bg-[#B11226]/90 hover:bg-[#B11226] text-[#EDEDED] font-serif text-lg tracking-widest transition-all duration-300 border border-[#B11226] shadow-[0_0_20px_rgba(177,18,38,0.3)] hover:shadow-[0_0_40px_rgba(177,18,38,0.6)]">
                            <Users className="w-5 h-5" /> MULTIPLAYER
                        </button>
                    </div>
                )}

                {!isMultiplayer && uiState === 'multiplayer' && (
                    <div className="flex flex-col items-center gap-6 animate-fade-in">
                        <p className="text-[#9C9C9C] font-serif italic text-lg mb-8 leading-relaxed max-w-lg">
                            Form an investigative team up to 4 players.<br />
                            Solving puzzles will sync across everyone's screen.
                        </p>

                        <div className="flex flex-col gap-2 w-80 text-left mb-2">
                            <label className="text-[#C6A15B] font-serif tracking-widest text-xs uppercase">Your Name *</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full bg-black/50 border-2 border-[#C6A15B]/40 text-[#EDEDED] py-3 px-4 focus:outline-none focus:border-[#C6A15B] font-serif"
                            />
                        </div>

                        <button onClick={handleCreateTeam} disabled={isLoading} className="w-80 flex items-center justify-center gap-3 px-8 py-5 bg-[#B11226]/90 hover:bg-[#8B0E1D] text-[#EDEDED] font-serif text-lg tracking-widest transition-all duration-300 border border-[#B11226]/50">
                            {isLoading ? 'INITIATING...' : <><Users className="w-5 h-5" /> CREATE NEW ROOM</>}
                        </button>

                        <div className="flex items-center gap-4 w-80 opacity-50 my-2">
                            <div className="h-px bg-[#EDEDED] flex-1"></div>
                            <span className="text-xs font-serif tracking-widest">OR</span>
                            <div className="h-px bg-[#EDEDED] flex-1"></div>
                        </div>

                        <button onClick={() => setUiState('join')} disabled={isLoading} className="w-80 flex items-center justify-center gap-3 px-8 py-5 bg-[#2A1E16]/80 hover:bg-[#1A120E] text-[#EDEDED] font-serif text-lg tracking-widest transition-all duration-300 border border-[#9C9C9C]/30 hover:border-[#EDEDED]/60 disabled:opacity-50">
                            <LogIn className="w-5 h-5" /> JOIN ROOM
                        </button>

                        <button onClick={() => setUiState('main')} className="mt-6 text-[#9C9C9C] hover:text-[#EDEDED] text-xs tracking-widest uppercase transition-colors">
                            ← Back to Main Menu
                        </button>
                    </div>
                )}

                {!isMultiplayer && uiState === 'join' && (
                    <form onSubmit={handleJoinTeam} className="flex flex-col items-center gap-6 animate-fade-in">
                        <div className="flex flex-col gap-2 w-80 text-left mb-2">
                            <label className="text-[#C6A15B] font-serif tracking-widest text-xs uppercase">Your Name *</label>
                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full bg-black/50 border-2 border-[#C6A15B]/40 text-[#EDEDED] py-3 px-4 focus:outline-none focus:border-[#C6A15B] font-serif"
                            />
                        </div>

                        <div className="flex flex-col gap-2 w-80 text-left">
                            <label className="text-[#C6A15B] font-serif tracking-widest text-xs uppercase">Room Code *</label>
                            <input
                                type="text"
                                maxLength={6}
                                value={joinCodeInput}
                                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                                placeholder="Enter 6-character code"
                                className="w-full bg-black/50 border-2 border-[#C6A15B]/40 text-center text-2xl tracking-[0.3em] font-mono text-[#EDEDED] py-4 focus:outline-none focus:border-[#C6A15B]"
                            />
                        </div>

                        <button type="submit" disabled={isLoading || joinCodeInput.length !== 6 || !playerName.trim()} className="w-80 flex items-center justify-center gap-3 px-8 py-4 bg-[#B11226] hover:bg-[#8B0E1D] text-[#EDEDED] font-serif text-lg tracking-widest transition-all duration-300 disabled:opacity-50">
                            {isLoading ? 'CONNECTING...' : 'ENTER'}
                        </button>

                        <button type="button" onClick={() => setUiState('multiplayer')} className="mt-6 text-[#9C9C9C] hover:text-[#EDEDED] text-xs tracking-widest uppercase transition-colors">
                            ← Cancel
                        </button>
                    </form>
                )}

                {/* Multiplayer Lobby waiting room */}
                {isMultiplayer && (
                    <div className="flex flex-col items-center gap-8 animate-fade-in w-full max-w-lg mx-auto bg-[#1A120E]/90 p-10 border border-[#C6A15B]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-lg backdrop-blur-md">
                        <div className="text-center">
                            <p className="text-[#9C9C9C] text-xs uppercase tracking-[0.3em] mb-2">Secure Team Link</p>
                            <h2 className="text-6xl font-mono text-[#C6A15B] tracking-[0.2em] font-bold drop-shadow-[0_0_15px_rgba(198,161,91,0.5)]">
                                {teamCode}
                            </h2>
                        </div>

                        <div className="w-full bg-black/50 rounded-lg p-6 border border-white/5">
                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                <span className="text-sm font-serif text-[#9C9C9C]">Investigators Connected</span>
                                <span className="text-sm font-mono text-[#EDEDED]">[{players.length}/4]</span>
                            </div>

                            <div className="space-y-3 text-left">
                                {players.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B]/50 flex items-center justify-center text-[#C6A15B]">
                                            <User size={14} />
                                        </div>
                                        <span className="font-mono text-[#EDEDED] tracking-wider truncate w-32">
                                            {p.id === myId ? 'YOU (Local)' : p.name || 'Agent'}
                                        </span>
                                        <span className="bg-[#B11226]/20 text-[#B11226] border border-[#B11226]/40 text-[9px] px-2 py-0.5 rounded uppercase tracking-wider ml-auto">
                                            {i === 0 ? 'Team Lead' : 'Agent'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {isHost ? (
                            <button onClick={startGame} className="w-full py-4 bg-[#B11226] hover:bg-[#8B0E1D] text-[#EDEDED] font-serif text-lg tracking-widest transition-all duration-300 border border-[#C6A15B]/30 shadow-[0_0_30px_rgba(177,18,38,0.4)]">
                                COMMENCE INVESTIGATION
                            </button>
                        ) : (
                            <div className="w-full py-4 bg-[#1A120E] border border-[#9C9C9C]/30 text-[#9C9C9C] font-serif text-sm tracking-widest text-center animate-pulse">
                                WAITING FOR LEAD TO START...
                            </div>
                        )}

                        <button onClick={handleLeave} className="text-[#9C9C9C] hover:text-[#B11226] text-xs tracking-widest uppercase transition-colors underline decoration-transparent hover:decoration-[#B11226] underline-offset-4">
                            Leave Team
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
