import React from 'react';
import { Star, Share2, ArrowRight } from 'lucide-react';
import { LevelConfig, LevelResult, PlayerInfo } from '../types.ts';
import { sound } from '../utils/sound.ts';

interface LevelCompleteModalProps {
  level: LevelConfig;
  result: LevelResult;
  player: PlayerInfo;
  isLastLevel: boolean;
  onNextLevel: () => void;
  onShare: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  result,
  isLastLevel,
  onNextLevel,
  onShare,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl">
        {/* Solved Apparel Picture */}
        <div className="relative aspect-4/3 w-full bg-zinc-950 overflow-hidden">
          <img
            src={level.imageUrl}
            alt={level.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-300">
              Level {level.id} Completed
            </span>
            <h3 className="text-lg font-black tracking-tight">{level.name}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Stars */}
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-6 h-6 ${
                  starIdx <= result.stars
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-zinc-200'
                }`}
              />
            ))}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block">Time</span>
              <span className="font-mono font-bold text-zinc-900 text-xs">
                {formatTime(result.timeSeconds)}
              </span>
            </div>
            <div className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block">Moves</span>
              <span className="font-mono font-bold text-zinc-900 text-xs">
                {result.moves}
              </span>
            </div>
            <div className="p-2.5 bg-zinc-900 text-white rounded-xl">
              <span className="text-[9px] uppercase font-bold text-zinc-400 block">Score</span>
              <span className="font-mono font-bold text-amber-400 text-xs">
                +{result.score}
              </span>
            </div>
          </div>

          {/* Buttons: Share & Next */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => {
                sound.playTap();
                onShare();
              }}
              className="flex-1 py-3 px-3 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => {
                sound.playTap();
                onNextLevel();
              }}
              className="flex-1 py-3 px-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span>{isLastLevel ? 'Finish' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
