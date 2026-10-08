import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { PuzzleBoard } from './components/PuzzleBoard.tsx';
import { LevelCompleteModal } from './components/LevelCompleteModal.tsx';
import { GameCompleteModal } from './components/GameCompleteModal.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { ImagePreviewModal } from './components/ImagePreviewModal.tsx';
import { LevelMapModal } from './components/LevelMapModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { LEVELS } from './data/levels.ts';
import { PlayerInfo, LevelResult, GameView } from './types.ts';
import { submitLeadToGoogleSheet } from './utils/googleSheets.ts';
import { ShareDataPayload } from './utils/socialShare.ts';
import { sound } from './utils/sound.ts';
import { ChevronLeft, ChevronRight, Grid } from 'lucide-react';

export default function App() {
  // Check if current route is /admin, #admin or ?admin=true
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      path.startsWith('/admin') ||
      hash === '#admin' ||
      search.includes('admin=true')
    );
  });

  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [gameView, setGameView] = useState<GameView>('login');
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [lastLevelResult, setLastLevelResult] = useState<LevelResult | null>(null);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<ShareDataPayload>({
    title: 'fabsi Fashion Puzzle',
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLevelMapOpen, setIsLevelMapOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Listen for hash / popstate changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      setIsAdminRoute(
        path.startsWith('/admin') ||
        hash === '#admin' ||
        search.includes('admin=true')
      );
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Restore saved player session & progress
  useEffect(() => {
    const saved = sessionStorage.getItem('fabsi_active_player');
    const savedUnlocked = localStorage.getItem('fabsi_unlocked_level');
    if (savedUnlocked) {
      setUnlockedLevel(Math.min(100, Math.max(1, parseInt(savedUnlocked, 10))));
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlayer(parsed);
        setGameView('playing');
      } catch {
        // ignore
      }
    }
  }, []);

  // If in admin route (/admin or #admin), show dedicated Admin Portal
  if (isAdminRoute) {
    return (
      <AdminPanel
        onBackToGame={() => {
          if (window.history.pushState) {
            window.history.pushState(null, '', '/');
          } else {
            window.location.hash = '';
          }
          setIsAdminRoute(false);
        }}
      />
    );
  }

  const handleStartGame = (name: string, phone: string) => {
    const newPlayer: PlayerInfo = {
      name,
      phone,
      startedAt: new Date().toISOString(),
      totalScore: 0,
    };
    setPlayer(newPlayer);
    setCurrentLevelIndex(0);
    setLevelResults([]);
    setGameView('playing');
    sessionStorage.setItem('fabsi_active_player', JSON.stringify(newPlayer));
  };

  const handleLevelComplete = (result: LevelResult) => {
    setLastLevelResult(result);
    const existingIndex = levelResults.findIndex((r) => r.levelId === result.levelId);
    let updatedResults: LevelResult[];
    if (existingIndex >= 0) {
      updatedResults = [...levelResults];
      updatedResults[existingIndex] = result;
    } else {
      updatedResults = [...levelResults, result];
    }
    setLevelResults(updatedResults);

    // Unlock next level (up to 100)
    const nextLevelNum = Math.min(100, result.levelId + 1);
    if (nextLevelNum > unlockedLevel) {
      setUnlockedLevel(nextLevelNum);
      localStorage.setItem('fabsi_unlocked_level', nextLevelNum.toString());
    }

    const newTotal = updatedResults.reduce((acc, r) => acc + r.score, 0);
    if (player) {
      const updatedPlayer = { ...player, totalScore: newTotal };
      setPlayer(updatedPlayer);
      sessionStorage.setItem('fabsi_active_player', JSON.stringify(updatedPlayer));

      // Asynchronously send updated score to Google Sheet
      submitLeadToGoogleSheet(player.name, player.phone, {
        finalScore: newTotal,
        levelsCompleted: updatedResults.length,
      }).catch(() => {});
    }

    setGameView('level_complete');
  };

  const handleNextLevel = () => {
    if (currentLevelIndex + 1 < LEVELS.length) {
      setCurrentLevelIndex((prev) => prev + 1);
      setGameView('playing');
    } else {
      setGameView('game_complete');
    }
  };

  const handleSelectLevelFromMap = (levelId: number) => {
    const targetIdx = Math.max(0, Math.min(LEVELS.length - 1, levelId - 1));
    setCurrentLevelIndex(targetIdx);
    setGameView('playing');
  };

  const handleOpenShareLevel = () => {
    if (!player || !lastLevelResult) return;
    const currentLvl = LEVELS[currentLevelIndex];
    setSharePayload({
      title: 'fabsi Fashion Puzzle',
      score: lastLevelResult.score,
      levelId: currentLvl.id,
      levelName: currentLvl.name,
      playerName: player.name,
      isGameComplete: false,
    });
    setIsShareModalOpen(true);
  };

  const handleOpenShareGame = () => {
    if (!player) return;
    const totalScore = levelResults.reduce((acc, r) => acc + r.score, 0);
    setSharePayload({
      title: 'fabsi Fashion Puzzle',
      score: totalScore,
      playerName: player.name,
      isGameComplete: true,
    });
    setIsShareModalOpen(true);
  };

  const handleResetCurrentLevel = () => {
    setGameView('playing');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('fabsi_active_player');
    setPlayer(null);
    setCurrentLevelIndex(0);
    setLevelResults([]);
    setLastLevelResult(null);
    setGameView('login');
  };

  const handleToggleSound = () => {
    const isNowOn = sound.toggle();
    setSoundEnabled(isNowOn);
  };

  const currentLevel = LEVELS[currentLevelIndex];
  const totalScore = player ? player.totalScore : 0;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Player Header: White background with Black 'fabsi' (NO ADMIN BUTTON) */}
      <Header
        player={player}
        currentLevel={currentLevelIndex + 1}
        totalLevels={LEVELS.length}
        score={totalScore}
        onResetGame={player ? handleResetCurrentLevel : undefined}
        onOpenLevelMap={() => setIsLevelMapOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Game Screen */}
      <main className="flex-1 bg-white">
        {gameView === 'login' || !player ? (
          <LoginScreen onStartGame={handleStartGame} />
        ) : (
          <div className="py-2">
            {/* Quick Level Navigation Bar */}
            <div className="max-w-md mx-auto px-4 flex items-center justify-between text-xs text-zinc-500 mb-1">
              <button
                disabled={currentLevelIndex === 0}
                onClick={() => {
                  sound.playTap();
                  setCurrentLevelIndex((prev) => Math.max(0, prev - 1));
                }}
                className="flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed hover:text-black cursor-pointer font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => setIsLevelMapOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono font-bold transition-colors cursor-pointer"
              >
                <Grid className="w-3 h-3 text-zinc-500" />
                <span>Level {currentLevelIndex + 1} of 100</span>
              </button>

              <button
                disabled={currentLevelIndex + 1 >= unlockedLevel || currentLevelIndex + 1 >= LEVELS.length}
                onClick={() => {
                  sound.playTap();
                  setCurrentLevelIndex((prev) => Math.min(LEVELS.length - 1, prev + 1));
                }}
                className="flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed hover:text-black cursor-pointer font-medium"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Active Puzzle Board */}
            <PuzzleBoard
              key={currentLevel.id}
              level={currentLevel}
              onLevelComplete={handleLevelComplete}
              onOpenPreview={() => setIsPreviewOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Player Footer (Clean: Only fabsi and optional Switch Player, NO ADMIN LINKS) */}
      <footer className="bg-white border-t border-zinc-100 py-4 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-bold text-black uppercase font-['Plus_Jakarta_Sans'] select-none">
            fabsi
          </span>
          {player && (
            <button
              onClick={handleLogout}
              className="hover:text-black cursor-pointer"
            >
              Switch Player
            </button>
          )}
        </div>
      </footer>

      {/* Modals for Gameplay */}
      {gameView === 'level_complete' && lastLevelResult && player && (
        <LevelCompleteModal
          level={currentLevel}
          result={lastLevelResult}
          player={player}
          isLastLevel={currentLevelIndex + 1 >= LEVELS.length}
          onNextLevel={handleNextLevel}
          onShare={handleOpenShareLevel}
        />
      )}

      {gameView === 'game_complete' && player && (
        <GameCompleteModal
          player={player}
          results={levelResults}
          onPlayAgain={() => {
            setCurrentLevelIndex(0);
            setGameView('playing');
          }}
          onShare={handleOpenShareGame}
        />
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        payload={sharePayload}
      />

      <ImagePreviewModal
        level={currentLevel}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      <LevelMapModal
        isOpen={isLevelMapOpen}
        onClose={() => setIsLevelMapOpen(false)}
        levels={LEVELS}
        currentLevelId={currentLevel.id}
        unlockedLevel={unlockedLevel}
        results={levelResults}
        onSelectLevel={handleSelectLevelFromMap}
      />
    </div>
  );
}
