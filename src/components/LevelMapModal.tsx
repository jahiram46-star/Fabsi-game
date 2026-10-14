import React, { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import { LevelConfig, LevelResult } from '../types.ts';
import { sound } from '../utils/sound.ts';

interface LevelMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  levels: LevelConfig[];
  currentLevelId: number;
  completedLevels: number[];
  unlockedLevel: number;
  results: LevelResult[];
  onSelectLevel: (levelId: number) => void;
}

export const LevelMapModal: React.FC<LevelMapModalProps> = ({
  isOpen,
  onClose,
  levels,
  currentLevelId,
  completedLevels,
  unlockedLevel,
  onSelectLevel,
}) => {
  const [activeTab, setActiveTab] = useState<number>(() => {
    // Automatically focus the tab containing current active level
    const lvl = currentLevelId || 1;
    if (lvl <= 25) return 0;
    if (lvl <= 50) return 1;
    if (lvl <= 75) return 2;
    return 3;
  });

  if (!isOpen) return null;

  const tabs = [
    { label: '1 - 25', start: 0, end: 25 },
    { label: '26 - 50', start: 25, end: 50 },
    { label: '51 - 75', start: 50, end: 75 },
    { label: '76 - 100', start: 75, end: 100 },
  ];

  const currentTabLevels = levels.slice(tabs[activeTab].start, tabs[activeTab].end);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h3 className="text-lg font-bold text-black font-['Plus_Jakarta_Sans']">
              Levels Progression
            </h3>
            <span className="text-xs text-zinc-500">
              Active Level: {currentLevelId} / 100 · Completed: {completedLevels.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 py-3 border-b border-zinc-100">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => {
                sound.playTap();
                setActiveTab(idx);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === idx
                  ? 'bg-black text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {currentTabLevels.map((lvl) => {
              const isCompleted = completedLevels.includes(lvl.id);
              const isCurrent = lvl.id === currentLevelId && !isCompleted;
              const isLocked = !isCompleted && !isCurrent;

              return (
                <button
                  key={lvl.id}
                  disabled={isCompleted || isLocked}
                  onClick={() => {
                    if (isCurrent) {
                      sound.playTap();
                      onSelectLevel(lvl.id);
                      onClose();
                    }
                  }}
                  title={
                    isCompleted
                      ? `Level ${lvl.id}: Already Completed (Cannot replay)`
                      : isCurrent
                      ? `Level ${lvl.id}: Play Now`
                      : `Level ${lvl.id}: Locked`
                  }
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center relative transition-all ${
                    isCurrent
                      ? 'bg-black text-white ring-2 ring-black ring-offset-2 cursor-pointer shadow-md'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 opacity-80 cursor-not-allowed'
                      : 'bg-zinc-50 text-zinc-300 border border-zinc-100 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="font-mono font-bold text-sm">
                    {lvl.id}
                  </span>

                  {isCompleted ? (
                    <div className="flex items-center gap-0.5 mt-0.5 text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <span className="text-[9px] font-bold text-amber-300 uppercase tracking-tighter mt-0.5">
                      Play
                    </span>
                  ) : (
                    <Lock className="w-3 h-3 mt-0.5 text-zinc-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Completed (Locked)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-black inline-block" />
            <span>Current Level</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 inline-block" />
            <span>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};
