interface ClueCardProps {
  text: string;
  className?: string;
}

export function ClueCard({ text, className }: ClueCardProps) {
  return (
    <div
      className={className || "absolute top-24 left-8 max-w-sm bg-[#1A120E]/90 backdrop-blur-sm border border-[#C6A15B]/20 p-6 shadow-2xl z-20"}
    >
      <div className="text-xs text-[#C6A15B] font-semibold mb-2 tracking-widest">CLUE</div>
      <div className="text-[#EDEDED] font-serif text-sm leading-relaxed whitespace-pre-line">
        {text}
      </div>
    </div>
  );
}
