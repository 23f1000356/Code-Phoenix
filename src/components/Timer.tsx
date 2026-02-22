import { useGame } from '../contexts/GameContext';

export function Timer() {
  const { gameState } = useGame();
  const { timeRemaining } = gameState;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const isLowTime = timeRemaining < 180;

  return (
    <div
      className={`text-2xl font-serif tracking-wider transition-all duration-500 ${isLowTime
          ? 'text-[#B11226] drop-shadow-[0_0_8px_rgba(177,18,38,0.5)]'
          : 'text-[#EDEDED]'
        }`}
    >
      {formattedTime}
    </div>
  );
}
