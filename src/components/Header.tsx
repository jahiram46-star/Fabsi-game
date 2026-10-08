import React from 'react';
import { Volume2, VolumeX, RefreshCw, Trophy, Grid } from 'lucide-react';
import { PlayerInfo } from '../types.ts';

interface HeaderProps {
  player: PlayerInfo | null;
  currentLevel: number;
  totalLevels: number;
  score: number;
  onResetGame?: () => void;
  onOpenLevelMap?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  player,
  currentLevel,
  totalLevels,
  score,
  onResetGame,
  onOpenLevelMap,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Name: Pure Black Text 'fabsi' */}
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase font-['Plus_Jakarta_Sans'] select-none">
            fabsi
          </span>
        </div>

        {/* Center: Live Level and Score */}
        {player && (
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-medium">
            <button
              onClick={onOpenLevelMap}
              title="Levels"
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-zinc-600" />
              <span>Level</span>
              <span className="font-bold font-mono">
                {currentLevel}/{totalLevels}
              </span>
            </button>

            <div className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-full font-mono font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>{score}</span>
            </div>
          </div>
        )}

        {/* Right utility buttons: Sound & Reset only (NO ADMIN BUTTONS) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute' : 'Unmute'}
            className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-zinc-800" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          {player && onResetGame && (
            <button
              onClick={onResetGame}
              title="Restart Level"
              className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
