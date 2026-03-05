
import { DecorationItem, AreaConfig } from '../types';

export const DECORATION_ITEMS: DecorationItem[] = [
  // Plants
  { id: 'potted_plant', name: '盆栽', price: 50, type: 'plant', emoji: '🪴', description: '放在角落增添綠意' },
  { id: 'flower_vase', name: '花瓶', price: 80, type: 'plant', emoji: '💐', description: '香氣迷人的鮮花' },
  { id: 'cactus', name: '小仙人掌', price: 60, type: 'plant', emoji: '🌵', description: '耐旱的可愛植物' },
  { id: 'tree', name: '裝飾樹', price: 150, type: 'plant', emoji: '🌳', description: '把森林搬進家裡' },

  // Furniture
  { id: 'wooden_chair', name: '木椅', price: 100, type: 'furniture', emoji: '🪑', description: '休息一下吧' },
  { id: 'sofa', name: '沙發', price: 300, type: 'furniture', emoji: '🛋️', description: '舒適的放鬆角落' },
  { id: 'bed', name: '床', price: 500, type: 'furniture', emoji: '🛏️', description: '做個好夢' },
  { id: 'lamp', name: '檯燈', price: 120, type: 'furniture', emoji: '💡', description: '照亮你的靈感' },
  { id: 'chest', name: '寶箱', price: 200, type: 'furniture', emoji: '🧳', description: '裝滿回憶' },
  { id: 'easel', name: '畫架', price: 250, type: 'furniture', emoji: '🎨', description: '揮灑創意' },
  
  // Fun
  { id: 'balloon', name: '氣球', price: 30, type: 'furniture', emoji: '🎈', description: '慶祝每一天' },
  { id: 'teddy', name: '泰迪熊', price: 180, type: 'furniture', emoji: '🧸', description: '永遠的陪伴' },
];

export const INITIAL_AREAS: Record<string, AreaConfig> = {
  'home': {
    id: 'home',
    name: '溫馨小屋',
    description: '你的初始小窩，雖然不大但很溫暖。',
    unlockCost: 0,
    backgroundClass: 'bg-orange-50',
    placedItems: [],
    placedPets: []
  },
  'forest': {
    id: 'forest',
    name: '迷霧森林',
    description: '充滿芬多精的戶外空間，適合喜歡自然的精靈。',
    unlockCost: 500,
    backgroundClass: 'bg-emerald-100',
    placedItems: [],
    placedPets: []
  },
  'beach': {
    id: 'beach',
    name: '陽光沙灘',
    description: '聽著海浪聲，享受悠閒的午後時光。',
    unlockCost: 1000,
    backgroundClass: 'bg-sky-100',
    placedItems: [],
    placedPets: []
  },
  'space': {
    id: 'space',
    name: '星際基地',
    description: '在無重力空間中漂浮，探索宇宙奧秘。',
    unlockCost: 2000,
    backgroundClass: 'bg-indigo-900 text-white',
    placedItems: [],
    placedPets: []
  }
};

export const getDecorationById = (id: string) => DECORATION_ITEMS.find(d => d.id === id);
