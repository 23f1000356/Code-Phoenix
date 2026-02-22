import { useGame } from '../contexts/GameContext';

export function Inventory() {
  const { gameState } = useGame();
  const { inventory } = gameState;

  const slots = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="flex gap-3 items-center justify-center">
      {slots.map((index) => {
        const item = inventory[index];
        return (
          <div
            key={index}
            className="w-14 h-14 border border-[#9C9C9C]/30 bg-[#0B0B0E]/80 backdrop-blur-sm
                     flex items-center justify-center transition-all duration-300
                     hover:border-[#C6A15B]/50"
          >
            {item && (
              <span className="text-2xl" title={item.name}>
                {item.icon}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
