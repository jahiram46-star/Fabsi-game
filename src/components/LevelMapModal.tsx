import React, { useState } from 'react';
import { X, Lock, Star, Check } from 'lucide-react';
import { LevelConfig, LevelResult } from '../types.ts';
import { sound } from '../utils/sound.ts';

interface LevelMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  levels: LevelConfig[];
  currentLevelId: number;
  unlockedLevel: number;
  results: LevelResult[];
  onSelectLevel: (levelId: number) => void;
}

export const LevelMapModal: React.FC<LevelMapModalProps> = ({
  isOpen,
  onClose,
  levels,
  currentLevelId,
  unlockedLevel,
  results,
  onSelectLevel,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0); // 0: 1-25, 1: 26-50, 2: 51-75, 3: 76-100

  if (!isOpen) return null;

  const tabs = [
    { label: '1 - 25', start: 0, end: 25 },
    { label: '26 - 50', start: 25, end: 50 },
    { label: '51 - 75', start: 50, end: 75 },
    { label: '76 - 100', start: 75, end: 100 },
  ];

  const currentTabLevels = levels.slice(tabs[activeTab].start, tabs[activeTab].end);

  const getResult = (lvlId: number) => results.find((r) => r.levelId === lvlId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h3 className="text-lg font-bold text-black font-['Plus_Jakarta_Sans']">
              Levels (1 - 100)
            </h3>
            <span className="text-xs text-zinc-500">
              Unlocked: {unlockedLevel}/100
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-black transition-colors"
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
              const isUnlocked = lvl.id <= unlockedLevel;
              const isCurrent = lvl.id === currentLevelId;
              const res = getResult(lvl.id);

              return (
                <button
                  key={lvl.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    sound.playTap();
                    onSelectLevel(lvl.id);
                    onClose();
                  }}
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-black text-white ring-2 ring-black ring-offset-2'
                      : isUnlocked
                      ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200'
                      : 'bg-zinc-50 text-zinc-300 border border-zinc-100 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span className="font-mono font-bold text-sm">
                    {lvl.id}
                  </span>

                  {isUnlocked ? (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {res ? (
                        Array.from({ length: res.stars }).map((_, s) => (
                          <span key={s} className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        ))
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      )}
                    </div>
                  ) : (
                    <Lock className="w-3 h-3 mt-0.5 text-zinc-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
