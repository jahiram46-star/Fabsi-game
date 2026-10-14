import { Volume2, VolumeX, RefreshCw, Trophy, Grid, User } from 'lucide-react';
import { PlayerInfo } from '../types.ts';

interface HeaderProps {
  player: PlayerInfo | null;
  currentLevel: number;
  totalLevels: number;
  score: number;
  onResetGame?: () => void;
  onOpenLevelMap?: () => void;
  onOpenProfile?: () => void;
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
  onOpenProfile,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo Image */}
        <div className="flex items-center gap-3">
          <img
            src="https://fabsi.co.uk/IMG_20260928_111259.png"
            alt="fabsi"
            className="h-8 sm:h-9 w-auto max-w-[140px] object-contain select-none"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              if (target.nextElementSibling) {
                (target.nextElementSibling as HTMLElement).style.display = 'block';
              }
            }}
          />
          <span className="hidden text-2xl sm:text-3xl font-black tracking-tighter text-black uppercase font-['Plus_Jakarta_Sans'] select-none">
            fabsi
          </span>
        </div>

        {/* Center: Live Level, Score & User Profile */}
        {player && (
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium">
            {/* User Profile Badge (IndexedDB) */}
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                title="View Player Profile & Gift Status"
                className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
              >
                <div className="w-4 h-4 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[70px] sm:max-w-[100px] truncate font-semibold">
                  {player.name}
                </span>
              </button>
            )}

            <button
              onClick={onOpenLevelMap}
              title="Levels"
              className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-3 py-1.5 rounded-full transition-colors cursor-pointer hidden sm:flex"
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
              <span className="text-[10px] text-zinc-400 font-sans hidden sm:inline">pts</span>
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
