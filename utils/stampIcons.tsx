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
  Gamepad2
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
  'anchor': Anchor
};

// Metadata for the selection UI
export const STAMP_OPTIONS = [
  { id: 'star', label: '星星', icon: Star },
  { id: 'heart', label: '愛心', icon: Heart },
  { id: 'sprout', label: '發芽', icon: Sprout },
  { id: 'fire', label: '熱血', icon: Flame },
  { id: 'book', label: '閱讀', icon: BookOpen },
  { id: 'muscle', label: '運動', icon: Dumbbell },
  { id: 'paw', label: '貓掌', icon: PawPrint },
  { id: 'moon', label: '晚安', icon: Moon },
  { id: 'sun', label: '早安', icon: Sun },
  { id: 'coffee', label: '咖啡', icon: Coffee },
  { id: 'music', label: '音樂', icon: Music },
  { id: 'game', label: '遊戲', icon: Gamepad2 },
  { id: 'trophy', label: '冠軍', icon: Trophy },
  { id: 'crown', label: '皇冠', icon: Crown },
  { id: 'zap', label: '能量', icon: Zap },
];

export const getStampIcon = (id: string) => {
  return STAMP_ICONS[id] || Star;
};
