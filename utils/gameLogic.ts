import { GameState, PetStage, LevelConfig, DayLog } from '../types';
import { getTodayString } from './dateUtils';

// Configuration for levels
export const getStageConfig = (level: number): LevelConfig => {
  if (level < 6) {
    return { 
      stage: PetStage.EGG, 
      label: '新生期', 
      emoji: '🥚', 
      colorBg: 'bg-amber-100',
      description: '一顆神秘的蛋，需要你的堅持來孵化。'
    };
  } else if (level < 16) {
    return { 
      stage: PetStage.BABY, 
      label: '幼苗期', 
      emoji: '🌱', 
      colorBg: 'bg-emerald-100',
      description: '生命開始了！繼續用行動灌溉它。'
    };
  } else if (level < 30) {
    return { 
      stage: PetStage.CHILD, 
      label: '成長期', 
      emoji: '🪴', 
      colorBg: 'bg-green-100',
      description: '正在變得強壯與高大。'
    };
  } else {
    return { 
      stage: PetStage.ADULT, 
      label: '成熟期', 
      emoji: '🌳', 
      colorBg: 'bg-sky-100',
      description: '你世界中宏偉的存在，守護著你的自律。'
    };
  }
};

// Calculate level based on EXP (Linear difficulty for MVP: Level = 1 + floor(EXP / 10))
export const calculateLevel = (exp: number): number => {
  return 1 + Math.floor(exp / 10);
};

// Calculate streak based on logs
export const calculateStreak = (logs: Record<string, DayLog>, todayStr: string): number => {
  let streak = 0;
  let checkDate = new Date(todayStr);

  // Check if today is stamped
  if (logs[todayStr]?.stamped) {
    streak++;
  }

  // Check backwards from yesterday
  // If today isn't stamped yet, we still check yesterday to see the "active" streak
  checkDate.setDate(checkDate.getDate() - 1); // Move to yesterday

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (logs[dateStr]?.stamped) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};
