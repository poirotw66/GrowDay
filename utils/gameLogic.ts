
import { PetStage, LevelConfig, DayLog, PetColor } from '../types';
import { getColorBg } from './petData';

// Define thresholds for evolution
export const STAGE_THRESHOLDS = {
  BABY: 6,   // Reach Lv 6 to become Baby
  CHILD: 16, // Reach Lv 16 to become Child
  ADULT: 30  // Reach Lv 30 to become Adult
};

// Configuration for levels (Metadata only, emoji comes from petData now)
export const getStageConfig = (level: number, petColor: PetColor): LevelConfig => {
  const baseBg = getColorBg(petColor);

  if (level < STAGE_THRESHOLDS.BABY) {
    return { 
      stage: PetStage.EGG, 
      label: '孵化期', 
      colorBg: baseBg,
      description: '一顆充滿潛力的蛋，正在等待你的行動。'
    };
  } else if (level < STAGE_THRESHOLDS.CHILD) {
    return { 
      stage: PetStage.BABY, 
      label: '幼年期', 
      colorBg: baseBg,
      description: '它破殼而出了！繼續灌溉讓它長大。'
    };
  } else if (level < STAGE_THRESHOLDS.ADULT) {
    return { 
      stage: PetStage.CHILD, 
      label: '成長期', 
      colorBg: baseBg,
      description: '正在變得強壯，性格也逐漸顯現。'
    };
  } else {
    return { 
      stage: PetStage.ADULT, 
      label: '完全體', 
      colorBg: baseBg,
      description: '它已經成為獨當一面的守護神。'
    };
  }
};

// Calculate level based on EXP (Linear difficulty: Level = 1 + floor(EXP / 10))
// 1 Stamp = 10 EXP = 1 Level Up (Simple progression for visual satisfaction)
export const calculateLevel = (exp: number): number => {
  return 1 + Math.floor(exp / 10);
};

// Calculate streak based on logs
export const calculateStreak = (logs: Record<string, DayLog>, todayStr: string): number => {
  let streak = 0;
  // eslint-disable-next-line prefer-const
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

// Get pet stage from level
export const getPetStage = (level: number): string => {
  if (level < STAGE_THRESHOLDS.BABY) return 'egg';
  if (level < STAGE_THRESHOLDS.CHILD) return 'baby';
  if (level < STAGE_THRESHOLDS.ADULT) return 'child';
  return 'adult';
};
