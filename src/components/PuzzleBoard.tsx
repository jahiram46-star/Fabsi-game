import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LevelConfig, LevelResult } from '../types.ts';
import { sound } from '../utils/sound.ts';
import confetti from 'canvas-confetti';

interface Tile {
  id: number;
  correctIndex: number;
  currentIndex: number;
}

interface PuzzleBoardProps {
  level: LevelConfig;
  onLevelComplete: (result: LevelResult) => void;
  onOpenPreview: () => void;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  level,
  onLevelComplete,
}) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(false);
  const [isPeeking, setIsPeeking] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTiles = level.gridSize * level.gridSize;

  const initializePuzzle = useCallback(() => {
    const initialTiles: Tile[] = Array.from({ length: totalTiles }, (_, index) => ({
      id: index,
      correctIndex: index,
      currentIndex: index,
    }));

    let shuffledIndices = Array.from({ length: totalTiles }, (_, i) => i);
    let attempts = 0;
    let isSame = true;

    while (isSame && attempts < 10) {
      for (let i = shuffledIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
      }
      const matches = shuffledIndices.filter((val, idx) => val === idx).length;
      if (matches <= Math.floor(totalTiles / 3)) {
        isSame = false;
      }
      attempts++;
    }

    const shuffledTiles: Tile[] = initialTiles.map((tile, i) => ({
      ...tile,
      currentIndex: shuffledIndices[i],
    }));

    setTiles(shuffledTiles);
    setSelectedTileIndex(null);
    setMoves(0);
    setSeconds(0);
    setIsSolved(false);
  }, [level.gridSize, totalTiles]);

  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  useEffect(() => {
    if (isSolved) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSolved]);

  const checkSolved = useCallback(
    (currentTiles: Tile[], currentMoves: number, currentTime: number) => {
      const allCorrect = currentTiles.every((t) => t.currentIndex === t.correctIndex);
      if (allCorrect && !isSolved && currentTiles.length > 0) {
        setIsSolved(true);
        sound.playSuccess();

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#000000', '#10b981', '#f59e0b', '#3b82f6'],
        });

        const targetMoves = level.targetMoves;
        let stars = 1;
        if (currentMoves <= targetMoves) {
          stars = 3;
        } else if (currentMoves <= Math.floor(targetMoves * 1.5)) {
          stars = 2;
        }

        // Rule: Each completed puzzle awards exactly 10 points (100 puzzles = 1000 total score)
        const finalScore = 10;

        setTimeout(() => {
          onLevelComplete({
            levelId: level.id,
            moves: currentMoves,
            timeSeconds: currentTime,
            score: finalScore,
            stars,
          });
        }, 600);
      }
    },
    [isSolved, level.id, level.targetMoves, onLevelComplete]
  );

  const handleTileClick = (clickedCurrentIndex: number) => {
    if (isSolved) return;

    if (selectedTileIndex === null) {
      setSelectedTileIndex(clickedCurrentIndex);
      sound.playTap();
    } else if (selectedTileIndex === clickedCurrentIndex) {
      setSelectedTileIndex(null);
      sound.playTap();
    } else {
      sound.playSwap();
      const newTiles = tiles.map((tile) => {
        if (tile.currentIndex === selectedTileIndex) {
          return { ...tile, currentIndex: clickedCurrentIndex };
        }
        if (tile.currentIndex === clickedCurrentIndex) {
          return { ...tile, currentIndex: selectedTileIndex };
        }
        return tile;
      });

      const nextMoves = moves + 1;
      setMoves(nextMoves);
      setTiles(newTiles);
      setSelectedTileIndex(null);

      checkSolved(newTiles, nextMoves, seconds);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const sortedTiles = [...tiles].sort((a, b) => a.currentIndex - b.currentIndex);

  return (
    <div className="max-w-md mx-auto px-4 py-3 select-none">
      {/* Title Only */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-black text-black tracking-tight">
          {level.name}
        </h2>
      </div>

      {/* Puzzle Grid */}
      <div className="relative aspect-square w-full max-w-[420px] mx-auto bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-300 shadow-xs p-1">
        {isPeeking ? (
          <div className="w-full h-full relative rounded-xl overflow-hidden">
            <img
              src={level.imageUrl}
              alt={level.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-full h-full grid gap-1 rounded-xl overflow-hidden bg-zinc-200"
            style={{
              gridTemplateColumns: `repeat(${level.gridSize}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${level.gridSize}, minmax(0, 1fr))`,
            }}
          >
            {sortedTiles.map((tile) => {
              const isSelected = selectedTileIndex === tile.currentIndex;
              const isCorrect = tile.currentIndex === tile.correctIndex;

              const col = tile.correctIndex % level.gridSize;
              const row = Math.floor(tile.correctIndex / level.gridSize);
              const step = 100 / (level.gridSize - 1);
              const posX = `${col * step}%`;
              const posY = `${row * step}%`;

              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile.currentIndex)}
                  style={{
                    backgroundImage: `url(${level.imageUrl})`,
                    backgroundPosition: `${posX} ${posY}`,
                    backgroundSize: `${level.gridSize * 100}% ${level.gridSize * 100}%`,
                  }}
                  className={`relative w-full h-full cursor-pointer transition-all duration-150 focus:outline-none rounded-lg overflow-hidden ${
                    isSelected
                      ? 'ring-3 ring-black ring-offset-1 z-20 scale-[0.96] shadow-md'
                      : 'hover:opacity-95'
                  }`}
                >
                  <div className="absolute inset-0 border border-black/10 pointer-events-none rounded-lg" />

                  {isCorrect && (
                    <div className="absolute bottom-1 right-1 pointer-events-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
                    </div>
                  )}

                  {showNumbers && (
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-mono font-bold w-4 h-4 rounded flex items-center justify-center">
                      {tile.correctIndex + 1}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
