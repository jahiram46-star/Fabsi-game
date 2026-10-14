import React, { useEffect } from 'react';
import { Trophy, Share2, RotateCcw, Gift, CheckCircle2 } from 'lucide-react';
import { PlayerInfo, LevelResult } from '../types.ts';
import { sound } from '../utils/sound.ts';
import confetti from 'canvas-confetti';

interface GameCompleteModalProps {
  player: PlayerInfo;
  results: LevelResult[];
  onPlayAgain: () => void;
  onShare: () => void;
  onOpenClaimGift: () => void;
}

export const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  player,
  results,
  onPlayAgain,
  onShare,
  onOpenClaimGift,
}) => {
  // Score: 10 per completed level, so 100 levels = 1000 pts
  const totalCompleted = results.length;
  const totalScore = Math.min(1000, totalCompleted * 10);
  const totalMoves = results.reduce((acc, r) => acc + r.moves, 0);
  const totalSeconds = results.reduce((acc, r) => acc + r.timeSeconds, 0);

  const formatTotalTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  useEffect(() => {
    sound.playGrandFanfare();

    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#000000', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl">
        {/* Banner */}
        <div className="bg-zinc-950 p-6 text-center text-white">
          <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black tracking-tight">
            100 Levels Complete!
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {player.name}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Main Score (1000 pts) */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-0.5">
              Final Score (10 pts × 100)
            </span>
            <div className="text-3xl font-black text-black font-mono">
              {totalScore} <span className="text-xs font-sans text-zinc-400 font-normal">/ 1000</span>
            </div>
          </div>

          {/* Physical Gift Notification Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/70 border border-amber-300 rounded-2xl p-4 text-center space-y-2">
            <div className="w-9 h-9 mx-auto rounded-full bg-amber-400 text-black flex items-center justify-center shadow-xs">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-amber-950">
                You Won a Physical Gift!
              </h4>
              <p className="text-[11px] text-amber-800 leading-tight mt-0.5">
                You completed all 100 puzzles. Claim your exclusive physical gift from fabsi now!
              </p>
            </div>

            {player.giftClaimed ? (
              <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-bold bg-white/80 py-1.5 rounded-lg border border-amber-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Gift Address Submitted</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenClaimGift();
                }}
                className="w-full py-2.5 px-3 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Claim Physical Gift</span>
              </button>
            )}
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-zinc-400 block text-[9px] font-bold uppercase">Total Time</span>
              <span className="font-mono font-bold text-zinc-900 text-xs">
                {formatTotalTime(totalSeconds)}
              </span>
            </div>
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-zinc-400 block text-[9px] font-bold uppercase">Total Moves</span>
              <span className="font-mono font-bold text-zinc-900 text-xs">
                {totalMoves}
              </span>
            </div>
          </div>

          {/* Share & Restart Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                sound.playTap();
                onShare();
              }}
              className="w-full py-3 px-4 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-zinc-700" />
              <span>Share 1000 Score</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onPlayAgain();
              }}
              className="w-full py-2 px-4 rounded-xl text-zinc-500 hover:text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-zinc-400" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
