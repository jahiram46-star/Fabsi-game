export interface PlayerInfo {
  name: string;
  phone: string;
  startedAt: string;
  totalScore: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  gridSize: number; // 3 for 3x3, 4 for 4x4
  targetMoves: number;
}

export interface LevelResult {
  levelId: number;
  moves: number;
  timeSeconds: number;
  score: number;
  stars: number;
}

export type GameView = 'login' | 'playing' | 'level_complete' | 'game_complete';

export interface LeadRecord {
  id: string;
  name: string;
  phone: string;
  submittedAt: string;
  finalScore?: number;
  levelsCompleted?: number;
  status: 'synced' | 'local_only' | 'pending';
}
