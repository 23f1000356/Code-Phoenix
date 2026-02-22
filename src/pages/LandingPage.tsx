import { useNavigate } from 'react-router-dom';
import { Search, Music, Layout, Loader } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useGame } from '../contexts/GameContext';

function LandingPage() {
  const navigate = useNavigate();
  const { changeRoom, startGame, username, updateUsername, userId, setShowBriefing } = useGame();
  const [isStarting, setIsStarting] = useState(false);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const crimeParallaxRef = useRef<HTMLDivElement>(null);
  const crimeSectionRef = useRef<HTMLElement>(null);

  const handleStartMission = () => {
    if (!username) {
      alert("Please enter your Agent Codename first.");
      return;
    }
    setIsStarting(true);
    setShowBriefing(true);
    startGame();
    navigate('/play');
  };

  const handleMultiplayer = () => {
    if (!username) {
      alert("Please enter your Agent Codename first.");
      return;
    }
    navigate('/lobby');
  };

  const scrollToLeaderboard = () => {
    document.getElementById('leaderboard')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // Hero parallax
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }

      // Crime scene section parallax — offset by section's top position
      if (crimeParallaxRef.current && crimeSectionRef.current) {
        const sectionTop = crimeSectionRef.current.offsetTop;
        const relativeScroll = scrollY - sectionTop;
        crimeParallaxRef.current.style.transform = `translateY(${relativeScroll * 0.35}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-[#EDEDED] font-serif">
      {/* ── HERO with Parallax ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Parallax background image */}
        <div
          ref={parallaxRef}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: 'url(/images/pic.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            top: '-15%',       /* overshoot so edges never show on scroll */
            bottom: '-15%',
          }}
        />

        {/* Dark crimson tint overlay */}
        <div className="absolute inset-0 bg-[#0B0B0E]/70" />

        {/* Red vignette edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0B0B0E_100%)]" />

        {/* Bottom fade to next section */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0B0E]" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <div className="mb-6 flex justify-center gap-4">
            <div className="px-4 py-1 border border-[#B11226]/50 bg-[#B11226]/10 text-[#B11226] text-xs tracking-[0.5em] uppercase animate-pulse">
              Active Investigation
            </div>
            <div className="px-4 py-1 border border-white/20 bg-white/5 text-white/40 text-[10px] tracking-[0.2em] uppercase">
              Agent ID: {userId}
            </div>
          </div>
          <h1
            className="text-8xl font-bold mb-6 tracking-tighter"
            style={{ textShadow: '0 0 50px rgba(177,18,38,0.5), 0 4px 20px rgba(0,0,0,1)' }}
          >
            THE ASHFORD CONSPIRACY
          </h1>
          <p className="text-2xl text-[#C8C8C8] mb-8 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>
            Eliza Ashford discovered the truth. Then she was silenced. <br />
            <span className="text-sm tracking-[0.2em] text-[#B11226] uppercase font-bold mt-4 block">10 Minutes to solve the murder.</span>
          </p>

          <div className="max-w-md mx-auto mb-12 bg-black/40 p-6 border border-white/5 backdrop-blur-md rounded-lg">
            <label className="block text-[10px] text-[#C6A15B] uppercase tracking-[0.3em] font-bold mb-3">Agent Codename</label>
            <input
              type="text"
              value={username}
              onChange={(e) => updateUsername(e.target.value)}
              placeholder="ENTER CODENAME..."
              className="w-full bg-black/60 border border-[#C6A15B]/30 px-6 py-4 text-center text-xl tracking-[0.2em] text-[#EDEDED] focus:border-[#B11226] outline-none transition-all"
            />
          </div>

          {isStarting ? (
            <div className="flex flex-col items-center justify-center gap-6">
              <Loader className="w-12 h-12 text-[#B11226] animate-spin" />
              <p className="text-xl text-[#C6A15B] tracking-[0.2em] uppercase font-bold">DEPLOYING OPERATIVE...</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center">
              <button
                onClick={handleStartMission}
                className="group relative px-10 py-5 bg-[#B11226] hover:bg-[#8B0E1D] transition-all duration-300 text-lg font-bold tracking-[0.3em]"
              >
                <div className="absolute inset-0 border border-white/20 -m-1 group-hover:m-0 transition-all" />
                SOLO MISSION
              </button>
              <button
                onClick={handleMultiplayer}
                className="group relative px-10 py-5 bg-[#C6A15B] hover:bg-[#A68848] text-black transition-all duration-300 text-lg font-bold tracking-[0.3em]"
              >
                <div className="absolute inset-0 border border-black/20 -m-1 group-hover:m-0 transition-all" />
                TEAM MISSION
              </button>
              <button
                onClick={scrollToLeaderboard}
                className="px-8 py-5 border-2 border-[#C6A15B]/30 hover:border-[#C6A15B] hover:bg-[#C6A15B]/5 transition-all duration-300 text-lg font-bold tracking-[0.3em] backdrop-blur-sm"
              >
                ELITE AGENTS
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── MISSION OVERVIEW ── */}
      <section className="py-24 px-6 relative z-10 bg-[#0B0B0E]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-8 bg-[#141419]/50 border border-[#B11226]/10 hover:border-[#B11226]/40 transition-colors">
              <div className="w-16 h-16 bg-[#B11226]/20 flex items-center justify-center rounded-full mx-auto mb-6">
                <Music className="w-8 h-8 text-[#B11226]" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-widest uppercase">SYMBOLS IN ART</h3>
              <p className="text-[#9C9C9C] text-sm leading-relaxed italic">Eliza encoded the truth in the very estate that trapped her. Music and puzzles are your only witness.</p>
            </div>
            <div className="text-center p-8 bg-[#141419]/50 border border-[#B11226]/10 hover:border-[#B11226]/40 transition-colors">
              <div className="w-16 h-16 bg-[#B11226]/20 flex items-center justify-center rounded-full mx-auto mb-6">
                <Layout className="w-8 h-8 text-[#B11226]" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-widest uppercase">STAGED REALITY</h3>
              <p className="text-[#9C9C9C] text-sm leading-relaxed italic">The killer manipulated the furniture and even the clocks to hide the moment of the crime.</p>
            </div>
            <div className="text-center p-8 bg-[#141419]/50 border border-[#B11226]/10 hover:border-[#B11226]/40 transition-colors">
              <div className="w-16 h-16 bg-[#B11226]/20 flex items-center justify-center rounded-full mx-auto mb-6">
                <Search className="w-8 h-8 text-[#B11226]" />
              </div>
              <h3 className="text-xl font-bold mb-4 tracking-widest uppercase">COLLECT EVIDENCE</h3>
              <p className="text-[#9C9C9C] text-sm leading-relaxed italic">Gather codes from across five rooms to build the final Case File and catch the killer.</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={crimeSectionRef} className="relative py-32 px-6 overflow-hidden">
        {/* Crime scene parallax background */}
        <div
          ref={crimeParallaxRef}
          className="absolute will-change-transform pointer-events-none"
          style={{
            backgroundImage: 'url(/images/pic.jpeg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            opacity: 0.15,
            top: '-20%',
            bottom: '-20%',
            left: 0,
            right: 0,
          }}
        />
        <div className="absolute inset-0 bg-[#0B0B0E]/90 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-20 text-center">
            <h2 className="text-5xl font-bold mb-4 tracking-tighter">THE MANSION ROOMS</h2>
            <div className="w-24 h-1 bg-[#B11226] mb-6" />
            <p className="text-[#9C9C9C] max-w-2xl font-serif italic text-lg leading-relaxed">
              Every room holds a piece of the Ashford Conspiracy. To catch the lawyer, you must solve them in order or explore the clues individually.
            </p>
          </div>

          <div className="space-y-12">
            {/* Top row — 2 primary investigation steps */}
            <div className="grid md:grid-cols-2 gap-12">
              {/* Mirror Room */}
              <div
                onClick={() => { startGame(); changeRoom('mirror'); navigate('/play'); }}
                className="group cursor-pointer relative overflow-hidden bg-[#141419] border border-white/5 hover:border-[#B11226]/50 transition-all duration-300"
              >
                <div className="aspect-[21/9] relative overflow-hidden">
                  <img src="/images/image.jpeg" alt="Mirror Room" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141419] to-transparent" />
                  <div className="absolute top-6 left-6 flex flex-col items-start">
                    <span className="px-3 py-1 bg-[#B11226] text-white text-[10px] font-bold tracking-widest mb-2">ROOM I</span>
                    <h3 className="text-3xl font-bold tracking-tighter shadow-black drop-shadow-lg">MIRROR — FALSE NARRATIVE</h3>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-[#A3A3A3] mb-6 font-serif italic">"Count what isn't there." Discover the financial records that establish the motive.</p>
                  <div className="flex items-center gap-2 text-[#C6A15B] text-xs font-bold tracking-widest uppercase">
                    <span>Evidence Card: Ledger 2735</span>
                  </div>
                </div>
              </div>

              {/* Piano Room */}
              <div
                onClick={() => { startGame(); changeRoom('piano'); navigate('/play'); }}
                className="group cursor-pointer relative overflow-hidden bg-[#141419] border border-white/5 hover:border-[#B11226]/50 transition-all duration-300"
              >
                <div className="aspect-[21/9] relative overflow-hidden">
                  <img src="/images/piano.jpeg" alt="Piano" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141419] to-transparent" />
                  <div className="absolute top-6 left-6 flex flex-col items-start">
                    <span className="px-3 py-1 bg-[#B11226] text-white text-[10px] font-bold tracking-widest mb-2">ROOM II</span>
                    <h3 className="text-3xl font-bold tracking-tighter shadow-black drop-shadow-lg">PIANO — THE TRUST</h3>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-[#A3A3A3] mb-6 font-serif italic">"Some truths are played." Reveal the year the Ashford Trust was founded.</p>
                  <div className="flex items-center gap-2 text-[#C6A15B] text-xs font-bold tracking-widest uppercase">
                    <span>Evidence Card: Founding Year 1912</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row — 3 detailed investigation steps */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Furniture Room */}
              <div
                onClick={() => { startGame(); changeRoom('furniture'); navigate('/play'); }}
                className="group cursor-pointer bg-[#141419] border border-white/5 hover:border-[#B11226]/30 transition-all"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img src="/images/furniture.jpeg" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-all duration-700" alt="Furniture" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-[10px] text-[#B11226] font-bold tracking-widest mb-2">ROOM III</span>
                    <h4 className="text-xl font-bold uppercase tracking-widest mb-4">STAGED SCENE</h4>
                    <p className="text-[10px] text-[#A3A3A3] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Align the furniture to uncover the board meeting date.</p>
                  </div>
                </div>
              </div>

              {/* Clock Room */}
              <div
                onClick={() => { startGame(); changeRoom('clock'); navigate('/play'); }}
                className="group cursor-pointer bg-[#141419] border border-white/5 hover:border-[#B11226]/30 transition-all"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img src="/images/clock.jpeg" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-all duration-700" alt="Clock" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-[10px] text-[#B11226] font-bold tracking-widest mb-2">ROOM IV</span>
                    <h4 className="text-xl font-bold uppercase tracking-widest mb-4">MOMENT OF DEATH</h4>
                    <p className="text-[10px] text-[#A3A3A3] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Freeze the time. 3:05 AM confirms the murderer's presence.</p>
                  </div>
                </div>
              </div>

              {/* Evidence Wall — Room V */}
              <div
                onClick={() => { startGame(); changeRoom('wall'); navigate('/play'); }}
                className="group cursor-pointer bg-[#141419] border border-white/5 hover:border-[#B11226]/30 transition-all"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img src="/images/wall.jpeg" alt="Evidence Wall" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-all duration-700" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-[10px] text-[#B11226] font-bold tracking-widest mb-2">ROOM V — FINALE</span>
                    <h4 className="text-xl font-bold uppercase tracking-widest mb-4">THE KILLER</h4>
                    <p className="text-[10px] text-[#A3A3A3] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Connect all the dots. Catch the Estate Lawyer.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LEADERBOARD ── */}
      <section id="leaderboard" className="py-24 px-6 bg-[#0B0B0E] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 tracking-tighter">ELITE AGENTS</h2>
            <div className="w-24 h-1 bg-[#B11226] mx-auto" />
          </div>

          <div className="bg-[#141419] border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[#C6A15B] text-xs tracking-widest uppercase">
                  <th className="p-6 font-bold">Rank</th>
                  <th className="p-6 font-bold">Team / Room</th>
                  <th className="p-6 font-bold">Agents</th>
                  <th className="p-6 font-bold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(useGame().leaderboard.length > 0 ? useGame().leaderboard : [
                  { teamName: 'ALPHA', players: 'Bond, Hunt', score: 850 },
                  { teamName: 'OVERSIGHT', players: 'Bourne, Salt', score: 720 },
                  { teamName: 'GHOST', players: 'Fisher, Price', score: 640 },
                ]).map((entry, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 font-mono text-2xl text-[#333]">#{i + 1}</td>
                    <td className="p-6 font-bold text-white uppercase tracking-widest">{entry.teamName}</td>
                    <td className="p-6 text-[#9C9C9C] italic">{entry.players}</td>
                    <td className="p-6 text-right font-bold text-[#B11226]">{entry.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-24 px-6 bg-[#0B0B0E] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center flex flex-col items-center">
            <h4 className="text-4xl font-bold tracking-tighter mb-4 text-white">CIPHER</h4>
            <div className="w-12 h-1 bg-[#B11226] mb-8" />
            <div className="flex gap-12 text-[#A3A3A3] text-sm uppercase tracking-widest">
              <span className="hover:text-white transition-colors cursor-pointer">Support</span>
              <span className="hover:text-white transition-colors cursor-pointer">Leaderboard</span>
              <span className="hover:text-white transition-colors cursor-pointer">Archive</span>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-[10px] text-[#333] tracking-[0.5em] uppercase">
            Ashford Estate Management © 2026
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
