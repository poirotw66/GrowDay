import { PetDefinition, PetColor, PetStage } from '../types';

export const PET_DEFINITIONS: PetDefinition[] = [
  // RED POOL (Fire/Passion)
  {
    id: 'fire_dragon',
    name: '烈焰幼龍',
    color: 'red',
    stages: {
      egg: '🥚',
      baby: '🦎',
      child: '🔥',
      adult: '🐉'
    },
    description: '誕生於熱情的火焰中，象徵著永不熄滅的意志。'
  },
  {
    id: 'sun_lion',
    name: '日冕雄獅',
    color: 'red',
    stages: {
      egg: '🥚',
      baby: '🐱',
      child: '🦁',
      adult: '🌞'
    },
    description: '吸收陽光成長的獅子，你的自律如同太陽般耀眼。'
  },

  // BLUE POOL (Water/Calm)
  {
    id: 'ice_whale',
    name: '深海冰鯨',
    color: 'blue',
    stages: {
      egg: '🥚',
      baby: '💧',
      child: '🐳',
      adult: '🐋'
    },
    description: '在深海中沉穩前行，象徵著寧靜而強大的累積。'
  },
  {
    id: 'cloud_bird',
    name: '雲端信使',
    color: 'blue',
    stages: {
      egg: '🥚',
      baby: '🐦',
      child: '☁️',
      adult: '🦅'
    },
    description: '自由翱翔於天際，將你的努力傳遞到遠方。'
  },

  // GREEN POOL (Nature/Growth)
  {
    id: 'forest_deer',
    name: '森之靈鹿',
    color: 'green',
    stages: {
      egg: '🥚',
      baby: '🌱',
      child: '🦌',
      adult: '🌲'
    },
    description: '森林的守護者，隨著你的每一步成長茁壯。'
  },
  {
    id: 'cactus_king',
    name: '沙漠仙人掌',
    color: 'green',
    stages: {
      egg: '🥚',
      baby: '🌵',
      child: '🏜️',
      adult: '🌺'
    },
    description: '在艱困中依然挺立，最終開出最美麗的花朵。'
  },

  // PURPLE POOL (Mystery/Magic)
  {
    id: 'magic_owl',
    name: '奧秘貓頭鷹',
    color: 'purple',
    stages: {
      egg: '🥚',
      baby: '🦉',
      child: '🔮',
      adult: '🌌'
    },
    description: '洞察世間的真理，智慧隨著時間而累積。'
  },
  {
    id: 'ghost_spirit',
    name: '調皮幽靈',
    color: 'purple',
    stages: {
      egg: '🥚',
      baby: '👻',
      child: '💀',
      adult: '👾'
    },
    description: '雖然調皮，但會一直默默跟在堅持的人身後。'
  }
];

export const getColorBg = (color: PetColor) => {
  switch (color) {
    case 'red': return 'bg-rose-100';
    case 'blue': return 'bg-sky-100';
    case 'green': return 'bg-emerald-100';
    case 'purple': return 'bg-violet-100';
    default: return 'bg-slate-100';
  }
};

export const getColorName = (color: PetColor) => {
  switch (color) {
    case 'red': return '熱情紅';
    case 'blue': return '寧靜藍';
    case 'green': return '生機綠';
    case 'purple': return '神秘紫';
    default: return '未知';
  }
};

/**
 * Randomly selects a pet ID from the available pool for a given color.
 */
export const assignRandomPet = (color: PetColor): string => {
  const pool = PET_DEFINITIONS.filter(p => p.color === color);
  if (pool.length === 0) return PET_DEFINITIONS[0].id; // Fallback
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex].id;
};

export const getPetById = (id: string): PetDefinition => {
  return PET_DEFINITIONS.find(p => p.id === id) || PET_DEFINITIONS[0];
};

export const getPetEmoji = (petId: string, stage: PetStage): string => {
  const pet = getPetById(petId);
  switch (stage) {
    case PetStage.EGG: return pet.stages.egg;
    case PetStage.BABY: return pet.stages.baby;
    case PetStage.CHILD: return pet.stages.child;
    case PetStage.ADULT: return pet.stages.adult;
    default: return pet.stages.egg;
  }
};
