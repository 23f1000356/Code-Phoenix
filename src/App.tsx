import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider, useGame } from './contexts/GameContext';
import LandingPage from './pages/LandingPage';
import { MenuScreen } from './components/MenuScreen';
import { PianoRoom } from './components/PianoRoom';
import { FurnitureRoom } from './components/FurnitureRoom';
import { ClockRoom } from './components/ClockRoom';
import Room1Game from './components/Room1Game';
import { EvidenceWallRoom } from './components/EvidenceWallRoom';
import LobbyPage from './pages/LobbyPage';
import { MultiplayerHUD } from './components/MultiplayerHUD';
import { MissionBriefing } from './components/MissionBriefing';
import { EndGameScreen } from './components/EndGameScreen';
import { AlertCircle } from 'lucide-react';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import { BackgroundAudio } from './components/BackgroundAudio';

function GameRouter() {
  const { gameState, changeRoom, solvePuzzle } = useGame();
  const content = (() => {
    switch (gameState.currentRoom) {
      case 'menu': return <MenuScreen />;
      case 'piano': return <PianoRoom />;
      case 'furniture': return <FurnitureRoom />;
      case 'clock': return <ClockRoom />;
      case 'mirror': return <Room1Game onSolve={() => { solvePuzzle('mirror'); changeRoom('piano'); }} />;
      case 'wall': return <EvidenceWallRoom />;
      default: return <MenuScreen />;
    }
  })();

  return (
    <div className="relative min-h-screen bg-[#0B0B0E]">
      {/* ── PERSISTENT MISSION HEADER ── */}
      <div className="fixed top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-md border-b border-[#B11226]/20 py-2 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-[#B11226] animate-pulse" />
          <span className="text-[10px] text-[#C6A15B] font-bold tracking-[0.3em] uppercase">Active Objective: </span>
          <span className="text-[10px] text-white tracking-[0.1em] uppercase font-serif italic">
            {gameState.currentRoom === 'mirror' && "Identify the discrepancies in the Ashford financial ledger."}
            {gameState.currentRoom === 'piano' && "Crack the Ashford Trust founding year using the melodic sequence."}
            {gameState.currentRoom === 'furniture' && "Reconstruct the torn image to find the board meeting coordinates."}
            {gameState.currentRoom === 'clock' && "Determine the exact time of death to confirm the suspect's presence."}
            {gameState.currentRoom === 'wall' && "Connect the evidence to expose the Estate Lawyer as the killer."}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[9px] text-white/30 tracking-[0.2em] font-mono">ENCRYPTED STREAM ACTIVE</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-[#B11226] animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-1 h-1 bg-[#B11226] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-[#B11226] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>

      {content}
      <MultiplayerHUD />
      <MissionBriefing />
      <EndGameScreen />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <BackgroundAudio />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/play" element={<GameRouter />} />
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Support the old links just in case, but they'll just go to the game */}
          <Route path="/room/*" element={<GameRouter />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
}

export default App;
