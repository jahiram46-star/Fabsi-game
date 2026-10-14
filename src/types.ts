export interface PlayerInfo {
  name: string;
  phone: string;
  startedAt: string;
  totalScore: number;
  completedLevels: number[];
  giftClaimed?: boolean;
  deliveryAddress?: string;
}

export interface UserProfile {
  id: string; // 'current_user'
  name: string;
  phone: string;
  createdAt: string;
  totalScore: number; // exactly 10 pts per level, up to 1000 pts
  completedLevels: number[]; // array of unique level IDs [1, 2, ...]
  unlockedLevel: number;
  giftClaimed?: boolean;
  deliveryAddress?: string;
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
  score: number; // always 10 per level completed
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
  giftClaimed?: boolean;
  deliveryAddress?: string;
  status: 'synced' | 'local_only' | 'pending';
}
