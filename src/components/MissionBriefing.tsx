import { useGame } from '../contexts/GameContext';
import { Shield, Target, Clock, Users, ChevronRight } from 'lucide-react';

export function MissionBriefing() {
    const { showBriefing, setShowBriefing, username } = useGame();

    if (!showBriefing) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0B0E]/95 backdrop-blur-md transition-all duration-500">
            <div className="max-w-4xl w-full mx-6 bg-[#141419] border border-[#B11226]/30 shadow-[0_0_100px_rgba(177,18,38,0.2)] rounded-lg overflow-hidden flex flex-col md:flex-row">

                {/* Visual Side */}
                <div className="md:w-1/3 bg-[#0B0B0E] relative overflow-hidden flex items-center justify-center p-12 border-b md:border-b-0 md:border-r border-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(177,18,38,0.2)_0,transparent_70%)]" />
                    <div className="relative text-center">
                        <Shield className="w-24 h-24 text-[#B11226] mx-auto mb-6 drop-shadow-[0_0_20px_rgba(177,18,38,0.5)]" />
                        <h2 className="text-2xl font-bold tracking-tighter text-[#EDEDED] uppercase">Operation<br />Ashford</h2>
                        <div className="w-12 h-1 bg-[#B11226] mx-auto mt-4" />
                    </div>
                </div>

                {/* Content Side */}
                <div className="md:w-2/3 p-10">
                    <div className="mb-8">
                        <span className="text-[10px] text-[#C6A15B] font-bold tracking-[0.4em] uppercase mb-2 block">Mission Briefing</span>
                        <h3 className="text-4xl font-bold tracking-tighter text-white mb-4 italic">WELCOME, AGENT {username?.toUpperCase() || 'UNKNOWN'}</h3>
                        <p className="text-[#9C9C9C] font-serif leading-relaxed italic">
                            The investigation of Eliza Ashford's murder depends on your precision.
                            You have been deployed to the Ashford Estate with a single directive:
                            <span className="text-[#B11226] ml-1 font-bold">Find the forensic evidence and expose the killer.</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                        <div className="flex gap-4">
                            <Target className="w-6 h-6 text-[#C6A15B] shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold tracking-widest text-[#EDEDED] uppercase mb-1">Objective</h4>
                                <p className="text-[11px] text-[#9C9C9C] leading-snug">Solve 5 forensic puzzles across the estate to build the final Case File.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Clock className="w-6 h-6 text-[#B11226] shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold tracking-widest text-[#EDEDED] uppercase mb-1">Time Limit</h4>
                                <p className="text-[11px] text-[#9C9C9C] leading-snug">The killer's trail grows cold in <span className="text-[#B11226] font-bold">10:00 Minutes</span>. Act fast.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Users className="w-6 h-6 text-blue-400 shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold tracking-widest text-[#EDEDED] uppercase mb-1">Intelligence</h4>
                                <p className="text-[11px] text-[#9C9C9C] leading-snug">Use the Intelligence Feed (Chat) to sync with teammates. Solved rooms sync live.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Shield className="w-6 h-6 text-green-500 shrink-0" />
                            <div>
                                <h4 className="text-xs font-bold tracking-widest text-[#EDEDED] uppercase mb-1">Assistance</h4>
                                <p className="text-[11px] text-[#9C9C9C] leading-snug">Use Hints sparingly. Every hint used reveals a piece of the truth.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowBriefing(false)}
                        className="w-full group flex items-center justify-between px-8 py-4 bg-[#B11226] hover:bg-[#8B0E1D] transition-all duration-300 rounded font-bold tracking-[0.3em] text-white uppercase text-sm"
                    >
                        <span>START THE GAME</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="mt-6 text-[9px] text-center text-[#333] tracking-[0.5em] uppercase border-t border-white/5 pt-4">
                        Classified Intelligence — Do Not Distribute
                    </p>
                </div>
            </div>
        </div>
    );
}
