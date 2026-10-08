import React, { useEffect } from 'react';
import { Trophy, Share2, RotateCcw } from 'lucide-react';
import { PlayerInfo, LevelResult } from '../types.ts';
import { sound } from '../utils/sound.ts';
import confetti from 'canvas-confetti';

interface GameCompleteModalProps {
  player: PlayerInfo;
  results: LevelResult[];
  onPlayAgain: () => void;
  onShare: () => void;
}

export const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  player,
  results,
  onPlayAgain,
  onShare,
}) => {
  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
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
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#000000', '#f59e0b', '#10b981', '#3b82f6'],
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
        <div className="p-6 space-y-5">
          {/* Main Score */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block mb-1">
              Final Score
            </span>
            <div className="text-4xl font-black text-black font-mono">
              {totalScore}
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-zinc-400 block text-[9px] font-bold uppercase">Time</span>
              <span className="font-mono font-bold text-zinc-900 text-xs">
                {formatTotalTime(totalSeconds)}
              </span>
            </div>
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-zinc-400 block text-[9px] font-bold uppercase">Moves</span>
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
              className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Share Score</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onPlayAgain();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
