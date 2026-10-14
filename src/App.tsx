import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { PuzzleBoard } from './components/PuzzleBoard.tsx';
import { LevelCompleteModal } from './components/LevelCompleteModal.tsx';
import { GameCompleteModal } from './components/GameCompleteModal.tsx';
import { ShareModal } from './components/ShareModal.tsx';
import { ImagePreviewModal } from './components/ImagePreviewModal.tsx';
import { LevelMapModal } from './components/LevelMapModal.tsx';
import { UserProfileModal } from './components/UserProfileModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { LEVELS } from './data/levels.ts';
import { PlayerInfo, UserProfile, LevelResult, GameView } from './types.ts';
import { submitLeadToGoogleSheet } from './utils/googleSheets.ts';
import {
  saveProfileToIndexedDB,
  getProfileFromIndexedDB,
  saveLevelProgressToIndexedDB,
  clearProfileFromIndexedDB,
} from './utils/indexedDB.ts';
import { ShareDataPayload } from './utils/socialShare.ts';
import { sound } from './utils/sound.ts';
import { Grid } from 'lucide-react';

export default function App() {
  const checkIsAdmin = (): boolean => {
    if (typeof window === 'undefined') return false;
    const host = window.location.hostname.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    const href = window.location.href.toLowerCase();

    const isSubdomain =
      host.startsWith('admin.') ||
      host.includes('admin') ||
      href.includes('admin.fabsi.co.uk');

    const isPathOrQuery =
      path.startsWith('/admin') ||
      path.includes('/admin') ||
      hash.includes('admin') ||
      search.includes('admin');

    return isSubdomain || isPathOrQuery;
  };

  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdmin);

  const [player, setPlayer] = useState<PlayerInfo | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);
  const [gameView, setGameView] = useState<GameView>('login');
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [lastLevelResult, setLastLevelResult] = useState<LevelResult | null>(null);

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [sharePayload, setSharePayload] = useState<ShareDataPayload>({
    title: 'fabsi Fashion Puzzle',
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLevelMapOpen, setIsLevelMapOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Listen for hash / popstate changes
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdmin());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Restore saved player profile from IndexedDB on startup
  useEffect(() => {
    getProfileFromIndexedDB().then((savedProfile) => {
      if (savedProfile) {
        setUserProfile(savedProfile);
        setPlayer({
          name: savedProfile.name,
          phone: savedProfile.phone,
          startedAt: savedProfile.createdAt,
          totalScore: savedProfile.totalScore,
          completedLevels: savedProfile.completedLevels || [],
          giftClaimed: savedProfile.giftClaimed,
          deliveryAddress: savedProfile.deliveryAddress,
        });
        setUnlockedLevel(Math.min(100, Math.max(1, savedProfile.unlockedLevel || 1)));

        // Reconstruct results array
        const reconstructed: LevelResult[] = (savedProfile.completedLevels || []).map((lvlId) => ({
          levelId: lvlId,
          score: 10,
          moves: 12,
          timeSeconds: 30,
          stars: 3,
        }));
        setLevelResults(reconstructed);
        setGameView('playing');
      }
    });
  }, []);

  // If in admin route (/admin or #admin or admin subdomain), show dedicated Admin Portal
  if (isAdminRoute) {
    return (
      <AdminPanel
        onBackToGame={() => {
          if (typeof window !== 'undefined' && window.location.hostname.startsWith('admin.')) {
            const mainHost = window.location.hostname.replace(/^admin\./, '');
            window.location.href = `${window.location.protocol}//${mainHost}`;
            return;
          }
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

  const handleStartGame = (profile: UserProfile) => {
    setUserProfile(profile);
    const newPlayer: PlayerInfo = {
      name: profile.name,
      phone: profile.phone,
      startedAt: profile.createdAt,
      totalScore: profile.totalScore,
      completedLevels: profile.completedLevels,
      giftClaimed: profile.giftClaimed,
      deliveryAddress: profile.deliveryAddress,
    };
    setPlayer(newPlayer);
    setCurrentLevelIndex(0);
    setUnlockedLevel(profile.unlockedLevel || 1);
    setLevelResults([]);
    setGameView('playing');
  };

  const handleLevelComplete = async (result: LevelResult) => {
    setLastLevelResult(result);

    // Save individual level result
    await saveLevelProgressToIndexedDB(result);

    // Rule: Each unique puzzle completed awards exactly 10 score points!
    // Total 100 puzzles = 1000 points.
    const currentCompleted = userProfile?.completedLevels ? [...userProfile.completedLevels] : [];
    if (!currentCompleted.includes(result.levelId)) {
      currentCompleted.push(result.levelId);
    }

    const calculatedScore = Math.min(1000, currentCompleted.length * 10);
    const nextLevelNum = Math.min(100, Math.max(unlockedLevel, result.levelId + 1));
    setUnlockedLevel(nextLevelNum);

    const updatedProfile: UserProfile = {
      id: 'current_user',
      name: player?.name || userProfile?.name || 'Player',
      phone: player?.phone || userProfile?.phone || '',
      createdAt: userProfile?.createdAt || new Date().toISOString(),
      totalScore: calculatedScore,
      completedLevels: currentCompleted,
      unlockedLevel: nextLevelNum,
      giftClaimed: userProfile?.giftClaimed,
      deliveryAddress: userProfile?.deliveryAddress,
    };

    setUserProfile(updatedProfile);
    setPlayer({
      name: updatedProfile.name,
      phone: updatedProfile.phone,
      startedAt: updatedProfile.createdAt,
      totalScore: calculatedScore,
      completedLevels: currentCompleted,
      giftClaimed: updatedProfile.giftClaimed,
      deliveryAddress: updatedProfile.deliveryAddress,
    });

    // Save updated profile to IndexedDB
    await saveProfileToIndexedDB(updatedProfile);

    // Keep level results array updated
    const existingIndex = levelResults.findIndex((r) => r.levelId === result.levelId);
    let updatedResults: LevelResult[];
    if (existingIndex >= 0) {
      updatedResults = [...levelResults];
      updatedResults[existingIndex] = result;
    } else {
      updatedResults = [...levelResults, result];
    }
    setLevelResults(updatedResults);

    // Sync updated score and gift status to Google Sheet
    submitLeadToGoogleSheet(updatedProfile.name, updatedProfile.phone, {
      finalScore: calculatedScore,
      levelsCompleted: currentCompleted.length,
      giftClaimed: updatedProfile.giftClaimed,
      deliveryAddress: updatedProfile.deliveryAddress,
    }).catch(() => {});

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
      score: 10,
      levelId: currentLvl.id,
      levelName: currentLvl.name,
      playerName: player.name,
      isGameComplete: false,
    });
    setIsShareModalOpen(true);
  };

  const handleOpenShareGame = () => {
    if (!player) return;
    setSharePayload({
      title: 'fabsi Fashion Puzzle',
      score: 1000,
      playerName: player.name,
      isGameComplete: true,
    });
    setIsShareModalOpen(true);
  };

  const handleResetCurrentLevel = () => {
    setGameView('playing');
  };

  const handleLogout = async () => {
    await clearProfileFromIndexedDB();
    setPlayer(null);
    setUserProfile(null);
    setCurrentLevelIndex(0);
    setUnlockedLevel(1);
    setLevelResults([]);
    setLastLevelResult(null);
    setGameView('login');
  };

  const handleToggleSound = () => {
    const isNowOn = sound.toggle();
    setSoundEnabled(isNowOn);
  };

  const currentLevel = LEVELS[currentLevelIndex];
  const totalScore = userProfile ? userProfile.totalScore : player ? player.totalScore : 0;

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Player Header: Logo + Player Profile (IndexedDB) + Score (10 pts/level) */}
      <Header
        player={player}
        currentLevel={currentLevelIndex + 1}
        totalLevels={LEVELS.length}
        score={totalScore}
        onResetGame={player ? handleResetCurrentLevel : undefined}
        onOpenLevelMap={() => setIsLevelMapOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Game Screen */}
      <main className="flex-1 bg-white">
        {gameView === 'login' || !player ? (
          <LoginScreen onStartGame={handleStartGame} />
        ) : (
          <div className="py-2">
            {/* Centered Level Indicator */}
            <div className="max-w-md mx-auto px-4 flex items-center justify-center mb-1">
              <button
                onClick={() => setIsLevelMapOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-mono font-bold transition-colors cursor-pointer text-xs"
              >
                <Grid className="w-3 h-3 text-zinc-500" />
                <span>Level {currentLevelIndex + 1} of 100</span>
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

      {/* Player Footer */}
      <footer className="bg-white border-t border-zinc-100 py-3.5 px-4">
        <div className="max-w-md mx-auto flex items-center justify-between text-[11px] text-zinc-400">
          <img
            src="https://fabsi.co.uk/IMG_20260928_111259.png"
            alt="fabsi"
            className="h-5 w-auto max-w-[90px] object-contain select-none opacity-80"
          />
          {player && (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-black cursor-pointer font-medium text-zinc-600"
            >
              Profile &amp; Gift Status ({totalScore}/1000 pts)
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
          onOpenClaimGift={() => setIsProfileModalOpen(true)}
        />
      )}

      {/* User Profile & Gift Claiming Modal (IndexedDB) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={userProfile}
        onProfileUpdated={(updated) => {
          setUserProfile(updated);
          setPlayer({
            name: updated.name,
            phone: updated.phone,
            startedAt: updated.createdAt,
            totalScore: updated.totalScore,
            completedLevels: updated.completedLevels,
            giftClaimed: updated.giftClaimed,
            deliveryAddress: updated.deliveryAddress,
          });
        }}
        onLogout={handleLogout}
      />

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
