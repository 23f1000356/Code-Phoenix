import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { Trophy, Clock, Target, ArrowLeft } from 'lucide-react';

export default function LeaderboardPage() {
    const navigate = useNavigate();
    const { getLeaderboard, leaderboardDetailed, userStats, username } = useGame();
    const [category, setCategory] = useState('top'); // top, recent, my

    useEffect(() => {
        getLeaderboard(category);
    }, [category]);

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-[#EDEDED] font-serif">
            {/* Header */}
            <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1
                            className="text-3xl font-bold tracking-tighter cursor-pointer"
                            onClick={() => navigate('/')}
                        >
                            CIPHER
                        </h1>
                        <nav className="hidden md:flex gap-6 text-xs font-bold tracking-[0.2em] uppercase text-white/40">
                            <span className="text-[#B11226] border-b border-[#B11226] pb-1 cursor-pointer">Leaderboard</span>
                            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/profile')}>Profile</span>
                            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/')}>Exit</span>
                        </nav>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#C6A15B] hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> BACK
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto py-16 px-6">
                <div className="text-center mb-16">
                    <h2 className="text-6xl font-bold tracking-tighter mb-4">GLOBAL LEADERBOARD</h2>
                    <div className="w-24 h-1 bg-[#B11226] mx-auto mb-8" />

                    {/* Category Switcher */}
                    <div className="flex justify-center gap-4">
                        {[
                            { id: 'top', label: 'Top Scores', icon: Trophy },
                            { id: 'recent', label: 'Recent Matches', icon: Clock },
                            { id: 'my', label: 'My Best', icon: Target }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setCategory(tab.id)}
                                className={`flex items-center gap-2 px-8 py-3 rounded border transition-all duration-300 text-xs font-bold tracking-widest uppercase ${category === tab.id
                                    ? 'bg-[#B11226] border-[#B11226] text-white shadow-[0_0_20px_rgba(177,18,38,0.3)]'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-[#141419] border border-white/10 rounded-lg overflow-hidden mb-12 shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/60 text-[#C6A15B] text-[10px] tracking-[0.3em] uppercase">
                                <th className="p-6 font-bold">Rank</th>
                                <th className="p-6 font-bold">Team / Room</th>
                                <th className="p-6 font-bold">Score</th>
                                <th className="p-6 font-bold">Time</th>
                                <th className="p-6 font-bold">Hints</th>
                                <th className="p-6 font-bold text-right">Accuracy</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {leaderboardDetailed.length > 0 ? (
                                leaderboardDetailed.map((entry, i) => (
                                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="p-6 font-mono text-xl text-white/20 group-hover:text-[#B11226] transition-colors">
                                            #{i + 1}
                                        </td>
                                        <td className="p-6">
                                            <div className="font-bold text-white uppercase tracking-widest mb-1">{entry.teamName}</div>
                                            <div className="text-[10px] text-white/40 italic">{entry.players}</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="font-mono font-bold text-[#B11226]">{entry.score.toLocaleString()}</span>
                                        </td>
                                        <td className="p-6 text-white/60 font-mono text-sm">
                                            {typeof entry.time === 'number' ? entry.formattedTime : entry.time}
                                        </td>
                                        <td className="p-6 text-white/60 text-sm">{entry.hints}</td>
                                        <td className="p-6 text-right">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${parseInt(entry.accuracy) > 90 ? 'bg-green-500/10 text-green-500' : 'bg-[#C6A15B]/10 text-[#C6A15B]'
                                                }`}>
                                                {entry.accuracy}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-white/20 italic tracking-widest">
                                        No intelligence matches recorded for this sector.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Personal Best Summary */}
                {userStats && (
                    <div className="bg-[#B11226]/5 border border-[#B11226]/20 p-8 rounded-lg flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <span className="text-[10px] text-[#B11226] font-bold tracking-[0.3em] uppercase mb-1 block">Your Operational Record</span>
                            <h3 className="text-3xl font-bold tracking-tighter text-white uppercase">AGENT {username || 'UNKNOWN'}</h3>
                        </div>
                        <div className="flex gap-12 text-center">
                            <div>
                                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Best Score</div>
                                <div className="text-2xl font-mono font-bold text-[#C6A15B]">{userStats.bestScore.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Best Time</div>
                                <div className="text-2xl font-mono font-bold text-white">
                                    {userStats.bestTime ? `${Math.floor(userStats.bestTime / 60)}:${(userStats.bestTime % 60).toString().padStart(2, '0')}` : '--:--'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Global Rank</div>
                                <div className="text-2xl font-mono font-bold text-[#B11226]">#17</div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
