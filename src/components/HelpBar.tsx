import { useState } from 'react';
import { Eye, SkipForward, X } from 'lucide-react';

interface HelpBarProps {
    /** What to show inside the Reveal modal */
    answerContent: React.ReactNode;
    /** Called when user confirms the skip */
    onSkip: () => void;
    /** Disable both buttons once the room is already solved */
    disabled?: boolean;
    /** Label shown on the skip confirmation button */
    nextRoomLabel?: string;
}

export function HelpBar({ answerContent, onSkip, disabled, nextRoomLabel = 'Next Room' }: HelpBarProps) {
    const [showReveal, setShowReveal] = useState(false);
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);

    return (
        <>
            {/* ── Floating button strip ── */}
            <div className="absolute bottom-24 right-8 flex flex-col gap-3 z-30">

                {/* Reveal Answer */}
                <button
                    onClick={() => !disabled && setShowReveal(true)}
                    disabled={disabled}
                    title="Reveal Answer"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A120E]/90 backdrop-blur-sm
                     border border-[#C6A15B]/30 text-[#C6A15B] font-serif text-sm
                     hover:border-[#C6A15B] hover:bg-[#2A1E16] transition-all duration-200
                     disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Eye className="w-4 h-4" />
                    Reveal Answer
                </button>

                {/* Skip Room */}
                <button
                    onClick={() => !disabled && setShowSkipConfirm(true)}
                    disabled={disabled}
                    title="Skip this room"
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A120E]/90 backdrop-blur-sm
                     border border-[#9C9C9C]/20 text-[#9C9C9C] font-serif text-sm
                     hover:border-[#B11226]/50 hover:text-[#B11226] hover:bg-[#1A120E] transition-all duration-200
                     disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <SkipForward className="w-4 h-4" />
                    Skip Room
                </button>
            </div>

            {/* ── Reveal Answer Modal ── */}
            {showReveal && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-[#0B0B0E]/80 backdrop-blur-sm z-50 animate-fade-in"
                    onClick={() => setShowReveal(false)}
                >
                    <div
                        className="bg-[#1A120E] border-2 border-[#C6A15B] p-10 rounded-lg shadow-2xl max-w-md w-full mx-4 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* close */}
                        <button
                            onClick={() => setShowReveal(false)}
                            className="absolute top-4 right-4 text-[#9C9C9C] hover:text-[#EDEDED] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <Eye className="w-5 h-5 text-[#C6A15B]" />
                            <h3 className="text-xl font-serif text-[#C6A15B] tracking-wide">ANSWER REVEALED</h3>
                        </div>

                        <div className="text-[#EDEDED] font-serif">{answerContent}</div>

                        <p className="mt-6 text-[#9C9C9C] text-xs font-serif italic">
                            Try to solve it yourself next time… the truth is more satisfying.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Skip Confirm Modal ── */}
            {showSkipConfirm && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-[#0B0B0E]/80 backdrop-blur-sm z-50 animate-fade-in"
                    onClick={() => setShowSkipConfirm(false)}
                >
                    <div
                        className="bg-[#1A120E] border-2 border-[#B11226]/50 p-10 rounded-lg shadow-2xl max-w-sm w-full mx-4 text-center relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowSkipConfirm(false)}
                            className="absolute top-4 right-4 text-[#9C9C9C] hover:text-[#EDEDED] transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <SkipForward className="w-8 h-8 text-[#B11226] mx-auto mb-4" />
                        <h3 className="text-xl font-serif text-[#EDEDED] mb-3">Skip This Room?</h3>
                        <p className="text-[#9C9C9C] font-serif text-sm mb-8 leading-relaxed">
                            You won't collect the code from this room.
                            The story will continue without its clue.
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => setShowSkipConfirm(false)}
                                className="px-6 py-2 border border-[#9C9C9C]/30 text-[#9C9C9C] font-serif text-sm
                           hover:border-[#EDEDED] hover:text-[#EDEDED] transition-colors"
                            >
                                Stay & Play
                            </button>
                            <button
                                onClick={() => { setShowSkipConfirm(false); onSkip(); }}
                                className="px-6 py-2 bg-[#B11226] hover:bg-[#8B0E1D] text-[#EDEDED] font-serif text-sm
                           transition-colors border border-[#B11226]"
                            >
                                Skip → {nextRoomLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
