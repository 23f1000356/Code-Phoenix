import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Trophy, Clock, Target, RotateCcw, Home, Users } from 'lucide-react';

export function EndGameScreen() {
    const navigate = useNavigate();
    const { gameCompleted, gameResult, setGameCompleted, isMultiplayer, leaveTeam, username } = useGame();

    if (!gameCompleted || !gameResult) return null;

    const handleRestart = () => {
        if (isMultiplayer) {
            leaveTeam();
            navigate('/lobby');
        } else {
            setGameCompleted(false);
            navigate('/');
        }
    };

    const handleHome = () => {
        if (isMultiplayer) {
            leaveTeam();
        }
        setGameCompleted(false);
        navigate('/');
    };

    const timeTaken = typeof gameResult.timeTaken === 'number' 
        ? gameResult.timeTaken 
        : parseInt(gameResult.time?.split(':')[0] || '0') * 60 + parseInt(gameResult.time?.split(':')[1] || '0');

    const timePercentage = Math.min((timeTaken / 600) * 100, 100);
    const scorePercentage = Math.min((gameResult.score / 1000) * 100, 100);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0B0B0E]/98 backdrop-blur-lg transition-all duration-500">
            <div className="max-w-2xl w-full mx-6 bg-gradient-to-b from-[#1A1A1F] to-[#0B0B0E] border-2 border-[#B11226]/50 shadow-[0_0_100px_rgba(177,18,38,0.4)] rounded-lg overflow-hidden">
                
                {/* Header */}
                <div className="bg-[#B11226]/20 border-b border-[#B11226]/30 px-10 py-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(177,18,38,0.3)_0,transparent_70%)]" />
                    <Trophy className="w-16 h-16 text-[#C6A15B] mx-auto mb-4 drop-shadow-[0_0_20px_rgba(198,161,91,0.5)] relative z-10" />
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase relative z-10 mb-2">
                        {gameResult.success ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
                    </h1>
                    <p className="text-[#C6A15B] tracking-[0.2em] font-bold text-sm uppercase relative z-10">
                        {gameResult.isMultiplayer ? 'TEAM INVESTIGATION' : 'SOLO INVESTIGATION'}
                    </p>
                </div>

                {/* Results Grid */}
                <div className="p-10 space-y-8">
                    {/* Score Section */}
                    <div className="bg-black/40 border border-[#C6A15B]/30 rounded-lg p-8">
                        <div className="grid grid-cols-2 gap-8">
                            {/* Score */}
                            <div className="text-center">
                                <div className="mb-4">
                                    <Target className="w-8 h-8 text-[#C6A15B] mx-auto mb-3" />
                                    <p className="text-[10px] text-[#C6A15B] font-bold tracking-widest uppercase mb-3">FINAL SCORE</p>
                                </div>
                                <div className="text-5xl font-bold text-white mb-3">{gameResult.score}</div>
                                <div className="w-full bg-black h-2 rounded overflow-hidden">
                                    <div
                                        className="bg-[#C6A15B] h-full transition-all duration-1000"
                                        style={{ width: `${scorePercentage}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-[#9C9C9C] mt-2">/ 1000 Points</p>
                            </div>

                            {/* Time */}
                            <div className="text-center">
                                <div className="mb-4">
                                    <Clock className="w-8 h-8 text-[#B11226] mx-auto mb-3" />
                                    <p className="text-[10px] text-[#B11226] font-bold tracking-widest uppercase mb-3">TIME TAKEN</p>
                                </div>
                                <div className="text-5xl font-bold text-white font-mono mb-3">{gameResult.time}</div>
                                <div className="w-full bg-black h-2 rounded overflow-hidden">
                                    <div
                                        className="bg-[#B11226] h-full transition-all duration-1000"
                                        style={{ width: `${timePercentage}%` }}
                                    />
                                </div>
                                <p className="text-[11px] text-[#9C9C9C] mt-2">/ 10:00 Minutes</p>
                            </div>
                        </div>
                    </div>

                    {/* Team Stats (if multiplayer) */}
                    {gameResult.isMultiplayer && gameResult.leaderboard && gameResult.leaderboard.length > 0 && (
                        <div className="bg-black/40 border border-[#B11226]/30 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-[#B11226]" />
                                <h3 className="text-sm font-bold tracking-widest uppercase text-white">Team Performance</h3>
                            </div>
                            <div className="space-y-3">
                                {gameResult.leaderboard.map((player: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center bg-black/50 p-3 rounded border border-white/5">
                                        <span className="text-[#EDEDED]">{player.name}</span>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-[#C6A15B]">{player.score} pts</div>
                                            <div className="text-[10px] text-[#9C9C9C]">{player.time}s</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agent Stats */}
                    <div className="bg-black/40 border border-[#C6A15B]/30 rounded-lg p-6">
                        <p className="text-[11px] text-[#C6A15B] font-bold tracking-[0.3em] uppercase mb-3">Agent Status</p>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-[#9C9C9C]">
                                <span>Agent Codename:</span>
                                <span className="text-white font-bold">{username}</span>
                            </div>
                            <div className="flex justify-between text-[#9C9C9C]">
                                <span>Difficulty Level:</span>
                                <span className="text-[#C6A15B] font-bold uppercase">NORMAL</span>
                            </div>
                            <div className="flex justify-between text-[#9C9C9C]">
                                <span>Investigation:</span>
                                <span className={`font-bold uppercase ${gameResult.success ? 'text-green-500' : 'text-red-500'}`}>
                                    {gameResult.success ? 'SUCCESSFUL' : 'FAILED'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={handleRestart}
                            className="flex-1 group flex items-center justify-center gap-3 px-8 py-4 bg-[#B11226] hover:bg-[#8B0E1D] transition-all duration-300 rounded font-bold tracking-[0.3em] text-white uppercase text-sm"
                        >
                            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                            RESTART
                        </button>
                        <button
                            onClick={handleHome}
                            className="flex-1 group flex items-center justify-center gap-3 px-8 py-4 bg-[#C6A15B]/20 hover:bg-[#C6A15B]/30 border border-[#C6A15B]/50 text-[#C6A15B] transition-all duration-300 rounded font-bold tracking-[0.3em] uppercase text-sm"
                        >
                            <Home className="w-5 h-5" />
                            HOME
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-black/20 border-t border-white/5 px-10 py-4 text-center">
                    <p className="text-[9px] text-[#333] tracking-[0.3em] uppercase">
                        Investigation Complete — Evidence Secured
                    </p>
                </div>
            </div>
        </div>
    );
}
