import { LevelConfig } from '../types.ts';
import panjabiImg from '../assets/images/clothing_panjabi_1791456150996.jpg';
import sareeImg from '../assets/images/clothing_saree_1791456168082.jpg';
import denimImg from '../assets/images/clothing_denim_1791456182674.jpg';
import dressImg from '../assets/images/clothing_dress_1791456195675.jpg';
import blazerImg from '../assets/images/clothing_blazer_1791456214248.jpg';
import hoodieImg from '../assets/images/clothing_hoodie_1791456230437.jpg';
import leatherImg from '../assets/images/clothing_leather_1791457094560.jpg';
import trenchImg from '../assets/images/clothing_trench_1791457110163.jpg';
import gownImg from '../assets/images/clothing_gown_1791457123605.jpg';
import knitImg from '../assets/images/clothing_knit_1791457135668.jpg';

export interface ApparelBase {
  title: string;
  category: string;
  img: string;
}

const BASE_APPARELS: ApparelBase[] = [
  { title: 'Emerald Silk Panjabi', category: 'Traditional Heritage', img: panjabiImg },
  { title: 'Banarasi Zari Saree', category: 'Royal Festive', img: sareeImg },
  { title: 'Vintage Denim Trucker', category: 'Street Denim', img: denimImg },
  { title: 'Pastel Silk Summer Dress', category: 'Contemporary Chic', img: dressImg },
  { title: 'Tailored Navy Blazer', category: 'Executive Formal', img: blazerImg },
  { title: 'Minimalist Urban Hoodie', category: 'Modern Streetwear', img: hoodieImg },
  { title: 'Biker Leather Jacket', category: 'Iconic Outerwear', img: leatherImg },
  { title: 'Classic Beige Trench Coat', category: 'Timeless Trench', img: trenchImg },
  { title: 'Emerald Satin Evening Gown', category: 'Haute Couture', img: gownImg },
  { title: 'Chunky Cable Knit Sweater', category: 'Luxury Knitwear', img: knitImg },
];

const EDITIONS = [
  'Original Cut',
  'Monogram Edition',
  'Atelier Special',
  'Runway Series',
  'Midnight Drop',
  'Summer Archive',
  'Autumn Palette',
  'Couture Capsule',
  'Velvet Edition',
  'Masterpiece Series',
];

// Generate 100 distinctive levels
export const LEVELS: LevelConfig[] = Array.from({ length: 100 }, (_, index) => {
  const levelNum = index + 1;
  const apparelIndex = index % BASE_APPARELS.length;
  const editionIndex = Math.floor(index / BASE_APPARELS.length) % EDITIONS.length;

  const base = BASE_APPARELS[apparelIndex];
  const edition = EDITIONS[editionIndex];

  // Grid progression:
  // Levels 1 - 25: 3x3 grid (9 tiles, beginner)
  // Levels 26 - 60: 3x3 grid (tighter moves)
  // Levels 61 - 100: 4x4 grid (16 tiles, master)
  const isHard = levelNum > 60;
  const gridSize = isHard ? 4 : 3;

  let targetMoves = 16;
  if (gridSize === 3) {
    targetMoves = Math.max(10, 18 - Math.floor(levelNum / 8));
  } else {
    targetMoves = Math.max(22, 36 - Math.floor((levelNum - 60) / 4));
  }

  return {
    id: levelNum,
    name: `${base.title}`,
    category: `${base.category} · ${edition}`,
    description: `Level ${levelNum} challenge: Solve the ${base.title.toLowerCase()} puzzle in fewest moves.`,
    imageUrl: base.img,
    gridSize,
    targetMoves,
  };
});
