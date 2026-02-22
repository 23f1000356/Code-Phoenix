import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import { User, Shield, Clock, Award, History, BarChart3, Activity } from 'lucide-react';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { userStats, username, userId, refreshStats, leaderboardDetailed } = useGame();

    const currentRankIndex = leaderboardDetailed.findIndex((entry) =>
        username && (
            entry.teamName === username ||
            entry.teamName === `Solo_${username}` ||
            entry.players.includes(username)
        )
    );
    const currentRank = currentRankIndex !== -1 ? `#${currentRankIndex + 1}` : 'UNRANKED';


    useEffect(() => {
        if (!userStats) {
            refreshStats();
        }
    }, [userStats, refreshStats]);

    if (!userStats) {
        return (
            <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center text-[#B11226] font-bold tracking-[0.5em] animate-pulse">
                RETRIEVING AGENT DATA...
            </div>
        );
    }

    const avgTime = userStats.gamesWon > 0 ? Math.floor(userStats.matchHistory.filter((m: any) => m.success).reduce((acc: number, m: any) => acc + m.time, 0) / userStats.gamesWon) : 0;

    return (
        <div className="min-h-screen bg-[#0B0B0E] text-[#EDEDED] font-serif">
            {/* Nav Header */}
            <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <h1 className="text-3xl font-bold tracking-tighter cursor-pointer" onClick={() => navigate('/')}>CIPHER</h1>
                        <nav className="hidden md:flex gap-6 text-xs font-bold tracking-[0.2em] uppercase text-white/40">
                            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/leaderboard')}>Leaderboard</span>
                            <span className="text-[#B11226] border-b border-[#B11226] pb-1 cursor-pointer">Profile</span>
                            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/')}>Exit</span>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto py-12 px-6">
                {/* 👤 PROFILE HEADER SECTION */}
                <section className="bg-gradient-to-r from-[#141419] to-transparent border border-white/5 p-10 rounded-lg mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 flex flex-col items-end">
                        <div className="text-[10px] text-white/20 tracking-[0.4em] uppercase mb-1">Status</div>
                        <div className="text-xs font-bold text-green-500 tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> ACTIVE AGENT
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-[#B11226]/10 border border-[#B11226]/30 flex items-center justify-center rounded shadow-[0_0_30px_rgba(177,18,38,0.1)]">
                            <User className="w-12 h-12 text-[#B11226]" />
                        </div>
                        <div>
                            <h2 className="text-5xl font-bold tracking-tighter mb-2 italic uppercase">Detective_{username || '8421'}</h2>
                            <div className="flex gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
                                <span className="flex items-center gap-2"><Shield className="w-3 h-3 text-[#B11226]" /> ID: {userId}</span>
                                <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> JOINED: {userStats.joinedDate}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left & Middle Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 📊 PERFORMANCE SUMMARY PANEL */}
                        <section className="bg-[#141419] border border-white/5 rounded-lg overflow-hidden">
                            <div className="bg-white/5 px-6 py-4 flex items-center gap-3">
                                <Activity className="w-4 h-4 text-[#C6A15B]" />
                                <h3 className="text-xs font-bold tracking-[0.3em] uppercase">Performance Summary</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y divide-white/5">
                                {[
                                    { label: 'Games Played', val: userStats.gamesPlayed },
                                    { label: 'Games Won', val: userStats.gamesWon },
                                    { label: 'Best Time', val: userStats.bestTime ? `${Math.floor(userStats.bestTime / 60)}:${(userStats.bestTime % 60).toString().padStart(2, '0')}` : '--:--' },
                                    { label: 'Average Time', val: avgTime ? `${Math.floor(avgTime / 60)}:${(avgTime % 60).toString().padStart(2, '0')}` : '--:--' },
                                    { label: 'Total Score', val: userStats.totalScore.toLocaleString() },
                                    { label: 'Hints Used', val: userStats.totalHints }
                                ].map((stat, i) => (
                                    <div key={i} className="p-8 hover:bg-white/[0.01] transition-colors">
                                        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{stat.label}</div>
                                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">{stat.val}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 🧩 PUZZLE PERFORMANCE BREAKDOWN */}
                        <section className="bg-[#141419] border border-white/5 rounded-lg overflow-hidden">
                            <div className="bg-white/5 px-6 py-4 flex items-center gap-3">
                                <BarChart3 className="w-4 h-4 text-[#B11226]" />
                                <h3 className="text-xs font-bold tracking-[0.3em] uppercase">Intelligence Sector Breakdown</h3>
                            </div>
                            <table className="w-full text-left">
                                <thead className="text-[9px] text-white/30 tracking-widest uppercase border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-4 font-bold">Puzzle Sector</th>
                                        <th className="px-8 py-4 font-bold">Avg Time</th>
                                        <th className="px-8 py-4 font-bold text-right">Accuracy</th>
                                        <th className="px-8 py-4 font-bold text-right">Solve Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm font-serif italic">
                                    {Object.entries(userStats.puzzleStats).map(([room, stats]: [string, any]) => (
                                        <tr key={room} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-8 py-5 text-white/80 uppercase font-bold tracking-widest text-[10px] not-italic">{room}</td>
                                            <td className="px-8 py-5 text-white/60 font-mono">{Math.floor(stats.avgTime / 60)}:{(stats.avgTime % 60).toString().padStart(2, '0')}</td>
                                            <td className="px-8 py-5 text-right font-mono text-[#C6A15B]">{stats.accuracy}%</td>
                                            <td className="px-8 py-5 text-right font-mono text-green-500/80">{stats.solveRate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>

                        {/* 📜 MATCH HISTORY SECTION */}
                        <section className="bg-[#141419] border border-white/5 rounded-lg overflow-hidden">
                            <div className="bg-white/5 px-6 py-4 flex items-center gap-3">
                                <History className="w-4 h-4 text-blue-400" />
                                <h3 className="text-xs font-bold tracking-[0.3em] uppercase">Field Match Records</h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                <table className="w-full text-left">
                                    <thead className="text-[9px] text-white/30 tracking-widest uppercase sticky top-0 bg-[#1A1A20] z-10">
                                        <tr>
                                            <th className="px-8 py-4 font-bold">Date</th>
                                            <th className="px-8 py-4 font-bold">Team Name</th>
                                            <th className="px-8 py-4 font-bold">Score</th>
                                            <th className="px-8 py-4 font-bold text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {userStats.matchHistory.map((match: any, i: number) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-4 text-white/40 text-[10px]">{match.date}</td>
                                                <td className="px-8 py-4 font-bold text-white/80 text-[10px] tracking-widest uppercase">{match.teamName}</td>
                                                <td className="px-8 py-4 font-mono font-bold text-[#B11226] text-sm">{match.score.toLocaleString()}</td>
                                                <td className="px-8 py-4 text-right font-mono text-sm text-white/60">{match.formattedTime}</td>
                                            </tr>
                                        ))}
                                        {userStats.matchHistory.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-12 text-center text-white/10 italic tracking-widest text-sm">No match records found on file.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* 🏆 LEADERBOARD POSITION */}
                        <section className="bg-[#B11226]/5 border border-[#B11226]/20 p-8 rounded-lg relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-[#B11226]/10 rounded-full blur-3xl group-hover:bg-[#B11226]/20 transition-all duration-700" />
                            <Award className="w-12 h-12 text-[#B11226] mb-6" />
                            <div className="text-[10px] text-[#B11226] font-bold tracking-[0.4em] uppercase mb-1">Global Standing</div>
                            <h4 className="text-4xl font-bold tracking-tighter text-white mb-6">RANK: {currentRank}</h4>
                            <div className="pt-6 border-t border-white/5">
                                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Highest Rank Achieved</div>
                                <div className="text-xl font-mono font-bold text-[#C6A15B]">{currentRank !== 'UNRANKED' ? currentRank : '--'}</div>
                            </div>
                        </section>

                        <section className="bg-[#141419] border border-white/5 p-8 rounded-lg">
                            <h3 className="text-xs font-bold tracking-[0.3em] uppercase text-white/60 mb-6">Security Clearance</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded border border-white/5">
                                    <div className="text-[9px] text-white/30 uppercase mb-1">Access Level</div>
                                    <div className="text-lg font-bold tracking-tight text-[#C6A15B]">FIELD OPERATIVE</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded border border-white/5">
                                    <div className="text-[9px] text-white/30 uppercase mb-1">Encryption Protocol</div>
                                    <div className="text-lg font-bold tracking-tight text-white">SHA-256 ACTIVE</div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
