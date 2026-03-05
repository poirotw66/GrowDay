
import { GameState } from '../types';
import { Trophy, Flame, Coins, Map, Users, Star, Crown, Zap, Home } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  icon: LucideIcon;
  condition: (state: GameState) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // --- Streak Achievements ---
  {
    id: 'streak_3',
    title: '初露鋒芒',
    description: '任一習慣連續打卡達到 3 天',
    rewardCoins: 50,
    icon: Flame,
    condition: (state) => Object.values(state.habits).some(h => h.longestStreak >= 3)
  },
  {
    id: 'streak_7',
    title: '一週挑戰',
    description: '任一習慣連續打卡達到 7 天',
    rewardCoins: 100,
    icon: Zap,
    condition: (state) => Object.values(state.habits).some(h => h.longestStreak >= 7)
  },
  {
    id: 'streak_30',
    title: '月度大師',
    description: '任一習慣連續打卡達到 30 天',
    rewardCoins: 500,
    icon: Star,
    condition: (state) => Object.values(state.habits).some(h => h.longestStreak >= 30)
  },
  
  // --- Wealth Achievements ---
  {
    id: 'wealth_100',
    title: '第一桶金',
    description: '持有金幣達到 100 枚',
    rewardCoins: 20,
    icon: Coins,
    condition: (state) => state.coins >= 100
  },
  {
    id: 'wealth_1000',
    title: '大富翁',
    description: '持有金幣達到 1000 枚',
    rewardCoins: 200,
    icon: Coins,
    condition: (state) => state.coins >= 1000
  },

  // --- Collection Achievements ---
  {
    id: 'pet_collector_5',
    title: '精靈觀察家',
    description: '在圖鑑中解鎖 5 種不同的精靈',
    rewardCoins: 150,
    icon: Users,
    condition: (state) => state.unlockedPets.length >= 5
  },
  
  // --- Decoration & World Achievements ---
  {
    id: 'shopper_1',
    title: '品味生活',
    description: '購買第一件家具或裝飾',
    rewardCoins: 30,
    icon: Home,
    condition: (state) => state.inventory.length >= 1
  },
  {
    id: 'explorer_2',
    title: '開拓者',
    description: '解鎖 2 個區域（含初始小屋）',
    rewardCoins: 100,
    icon: Map,
    condition: (state) => state.world.unlockedAreas.length >= 2
  },

  // --- Legacy Achievements ---
  {
    id: 'legacy_1',
    title: '傳承開始',
    description: '第一次讓精靈進入榮譽殿堂',
    rewardCoins: 300,
    icon: Crown,
    condition: (state) => state.retiredPets.length >= 1
  },
  {
    id: 'legacy_5',
    title: '傳說締造者',
    description: '累積 5 隻退休精靈',
    rewardCoins: 1000,
    icon: Trophy,
    condition: (state) => state.retiredPets.length >= 5
  }
];

export const getAchievementById = (id: string) => ACHIEVEMENTS.find(a => a.id === id);
