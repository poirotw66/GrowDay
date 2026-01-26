import React from 'react';
import { 
  Star, 
  Sprout, 
  Heart, 
  BookOpen, 
  Dumbbell, 
  PawPrint, 
  Flame, 
  Moon, 
  Trophy, 
  Sun, 
  Zap, 
  Smile, 
  Music, 
  Coffee, 
  Crown,
  Anchor,
  Feather,
  Gamepad2,
  Diamond
} from 'lucide-react';

// Define the available icons
export const STAMP_ICONS: Record<string, React.FC<any>> = {
  'star': Star,
  'sprout': Sprout,
  'heart': Heart,
  'book': BookOpen,
  'muscle': Dumbbell,
  'paw': PawPrint,
  'fire': Flame,
  'moon': Moon,
  'trophy': Trophy,
  'sun': Sun,
  'zap': Zap,
  'smile': Smile,
  'music': Music,
  'coffee': Coffee,
  'crown': Crown,
  'game': Gamepad2,
  'feather': Feather,
  'anchor': Anchor,
  'diamond': Diamond
};

export interface StampOption {
  id: string;
  label: string;
  icon: any;
  unlockHint?: string; // If present, the icon is locked by default
}

// Metadata for the selection UI
export const STAMP_OPTIONS: StampOption[] = [
  // Defaults (No unlock hint)
  { id: 'star', label: '星星', icon: Star },
  { id: 'heart', label: '愛心', icon: Heart },
  { id: 'sprout', label: '發芽', icon: Sprout },
  { id: 'smile', label: '微笑', icon: Smile },
  { id: 'sun', label: '早安', icon: Sun },
  { id: 'moon', label: '晚安', icon: Moon },
  { id: 'book', label: '閱讀', icon: BookOpen },
  { id: 'muscle', label: '運動', icon: Dumbbell },
  { id: 'paw', label: '陪伴', icon: PawPrint },
  { id: 'coffee', label: '咖啡', icon: Coffee },
  { id: 'music', label: '音樂', icon: Music },
  { id: 'game', label: '遊戲', icon: Gamepad2 },

  // Locked Achievements
  { id: 'feather', label: '輕盈', icon: Feather, unlockHint: '累積打卡 3 次' },
  { id: 'fire', label: '熱血', icon: Flame, unlockHint: '連續打卡 3 天' },
  { id: 'zap', label: '能量', icon: Zap, unlockHint: '連續打卡 7 天' },
  { id: 'anchor', label: '定錨', icon: Anchor, unlockHint: '單月打卡 20 天' },
  { id: 'crown', label: '皇冠', icon: Crown, unlockHint: '等級達到 Lv.10' },
  { id: 'trophy', label: '冠軍', icon: Trophy, unlockHint: '連續打卡 30 天' },
  { id: 'diamond', label: '永恆', icon: Diamond, unlockHint: '連續打卡 100 天' },
];

export const getStampIcon = (id: string) => {
  return STAMP_ICONS[id] || Star;
};

export const getDefaultUnlockedIcons = () => {
  return STAMP_OPTIONS.filter(opt => !opt.unlockHint).map(opt => opt.id);
};
