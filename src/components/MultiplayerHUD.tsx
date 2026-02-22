import { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { MessageSquare, Users, ChevronRight, Send, Wifi } from 'lucide-react';

import { Shield, Target, Microscope, Stethoscope } from 'lucide-react';
import { VoiceChat } from './VoiceChat';

const ROLE_ICONS: Record<string, any> = {
    detective: Target,
    tech: Shield,
    analyst: Microscope,
    forensics: Stethoscope
};

export function MultiplayerHUD() {
    const { isMultiplayer, players, chatMessages, sendChat, myId, myRole, difficulty, sendReaction, reactions } = useGame();
    const [chatOpen, setChatOpen] = useState(false);
    const [message, setMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, chatOpen]);

    if (!isMultiplayer) return null;

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            sendChat(message);
            setMessage('');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
            {/* Player Presence Panel */}
            <div className="pointer-events-auto bg-[#141419]/90 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-2xl min-w-[200px]">
                <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#C6A15B]" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-white">Team Status</span>
                    </div>
                    {myRole && (
                        <div className="flex items-center gap-1 bg-[#C6A15B]/20 px-2 py-0.5 rounded border border-[#C6A15B]/30" title="Your Assigned Class">
                            {(() => {
                                const Icon = ROLE_ICONS[myRole] || Target;
                                return <Icon className="w-3 h-3 text-[#C6A15B]" />;
                            })()}
                            <span className="text-[9px] uppercase font-bold text-[#C6A15B] tracking-widest leading-none">{myRole}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 mb-3 bg-black/40 px-2 py-1 rounded text-[10px] text-white/50 tracking-widest font-mono">
                    THREAT: <span className={`font-bold ${difficulty === 'hard' ? 'text-red-500' : difficulty === 'easy' ? 'text-green-500' : 'text-[#C6A15B]'}`}>{difficulty.toUpperCase()}</span>
                </div>
                <div className="space-y-2">
                    {players.map(p => (
                        <div key={p.id} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${p.id === myId ? 'bg-blue-500' : 'bg-green-500'}`} />
                                <div className="flex flex-col">
                                    <span className="text-sm text-[#EDEDED] font-medium leading-none">{p.name} {p.id === myId && "(You)"}</span>
                                    {p.role && <span className="text-[9px] text-[#C6A15B] uppercase tracking-widest mt-1 font-bold">{p.role}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Floating Reaction if any */}
                                {reactions.map(r => r.senderId === p.id && Date.now() - r.timestamp < 3000 ? (
                                    <div key={r.timestamp} className="animate-in fade-in zoom-in slide-in-from-bottom-2 absolute -mt-6">
                                        <span className="text-xl inline-block" style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))' }}>{r.type}</span>
                                    </div>
                                ) : null)}

                                {p.puzzle && <span className="text-[8px] bg-[#B11226]/20 text-[#B11226] px-1.5 py-0.5 rounded uppercase font-bold">{p.puzzle}</span>}
                                <Wifi className="w-3 h-3 text-green-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat System */}
            <div className="pointer-events-auto flex flex-col items-end">
                {chatOpen ? (
                    <div className="bg-[#141419]/95 backdrop-blur-lg border border-[#C6A15B]/30 w-80 h-[400px] flex flex-col rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-4 bg-[#0B0B0E] border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#C6A15B]" />
                                <span className="text-sm font-bold tracking-widest uppercase text-white">Intelligence Feed</span>
                            </div>
                            <button onClick={() => setChatOpen(false)} className="text-[#9C9C9C] hover:text-white transition-colors">
                                <ChevronRight className="w-4 h-4 rotate-90" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-serif">
                            {chatMessages.length === 0 && (
                                <div className="text-center text-[#333] text-xs italic mt-20 uppercase tracking-widest">
                                    Secure channel established.<br />Encryption active.
                                </div>
                            )}
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.senderId === myId ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-[10px] font-bold text-[#C6A15B] uppercase tracking-tighter">{msg.senderName}</span>
                                        <span className="text-[8px] text-[#333]">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`px-3 py-2 rounded-lg text-sm max-w-[90%] ${msg.senderId === myId ? 'bg-[#B11226] text-white rounded-tr-none' : 'bg-white/5 text-[#D1D1D1] border border-white/10 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="p-3 bg-[#0B0B0E] border-t border-white/10 flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                placeholder="Send message..."
                                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C6A15B] transition-colors"
                            />
                            <button type="submit" className="bg-[#C6A15B] text-black p-2 rounded hover:bg-[#A68848] transition-colors">
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <button
                        onClick={() => setChatOpen(true)}
                        className="bg-[#B11226] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all flex items-center justify-center relative group"
                    >
                        <MessageSquare className="w-6 h-6" />
                        <div className="absolute top-0 right-0 w-3 h-3 bg-[#C6A15B] border-2 border-[#141419] rounded-full animate-pulse" />
                        <span className="absolute right-full mr-4 bg-black/80 text-white text-[10px] font-bold py-1 px-3 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Team Chat</span>
                    </button>
                )}
            </div>

            {/* Quick Reactions Panel */}
            <div className="flex gap-4 items-end">
                <VoiceChat />

                <div className="pointer-events-auto flex items-center gap-2 bg-[#141419]/90 backdrop-blur-md p-2 rounded-full border border-white/5">
                    {['👍', '⚠️', '👀', '💡', '❗'].map(emoji => (
                        <button
                            key={emoji}
                            onClick={() => sendReaction(emoji)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-lg"
                            title="Send Reaction"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
