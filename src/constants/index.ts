// Hybrid System Constants
import type { DailyTask, WorkoutDay, Quote, Stage1Weights, Stage2Weights, Stage3Weights } from '@/types';

// ==================== STAGE CONFIGURATION ====================

export const STAGE_CONFIG = {
  1: {
    name: 'Foundation',
    description: 'Build discipline, physical base, learning loop, observation skills',
    weeks: { start: 1, end: 12 },
    passThreshold: 85,
    color: '#00D9FF'
  },
  2: {
    name: 'Strategy & Control',
    description: 'Foresight, real-time analysis, emotional control, subtle influence',
    weeks: { start: 13, end: 28 },
    passThreshold: 80,
    color: '#9D4EDD'
  },
  3: {
    name: 'High-Stakes Adaptation',
    description: 'High-pressure challenges, fast failure cycles, adaptive switching',
    weeks: { start: 29, end: 52 },
    passThreshold: 75,
    color: '#FF006E'
  }
};

// ==================== STAGE WEIGHTS ====================

export const STAGE_1_WEIGHTS: Stage1Weights = {
  wakeTime: 0.15,
  training: 0.20,
  observationDaily: 0.20,
  observationWeekly: 0.15,
  journaling: 0.15,
  phoneBoundary: 0.075,
  microSkill: 0.075
};

export const STAGE_2_WEIGHTS: Stage2Weights = {
  predictionAccuracy: 0.20,
  emotionalControl: 0.20,
  influenceDaily: 0.25,
  influenceReflection: 0.05,
  influenceTheme: 0.10,
  physical: 0.10,
  learning: 0.05,
  journaling: 0.05
};

export const STAGE_3_WEIGHTS: Stage3Weights = {
  failureCycles: 0.20,
  chaosAdaptation: 0.20,
  mission: 0.20,
  influenceAdoption: 0.20,
  physical: 0.10,
  systemLog: 0.10
};

// ==================== DAILY TASKS ====================

export const ALL_TASKS: DailyTask[] = [
  // STAGE 1 TASKS
  {
    id: 'wake-time',
    name: 'Fixed Wake Time',
    category: 'wake',
    stage: 1,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow', 'red'],
    weight: 15,
    order: 1
  },
  {
    id: 'training',
    name: 'Body as a Weapon - Training',
    category: 'training',
    stage: 1,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 20,
    order: 2
  },
  {
    id: 'observation-daily',
    name: 'Observation Drill (60-90s)',
    category: 'observation',
    stage: 1,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow', 'red'],
    weight: 20,
    order: 3
  },
  {
    id: 'observation-weekly',
    name: 'Deep Observation Drill (Weekly)',
    category: 'observation',
    stage: 1,
    frequency: 'weekly',
    dayModeAvailability: ['green', 'yellow'],
    weight: 15,
    order: 4
  },
  {
    id: 'journaling',
    name: 'System Log / Journal',
    category: 'journaling',
    stage: 1,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow', 'red'],
    weight: 15,
    order: 5
  },
  {
    id: 'phone-boundary',
    name: 'Phone Boundary (30m after wake & before sleep)',
    category: 'phone',
    stage: 1,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 7.5,
    order: 6
  },
  {
    id: 'micro-skill',
    name: 'Micro-Skill Learning (20-60 min)',
    category: 'microskill',
    stage: 1,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 7.5,
    order: 7
  },
  
  // STAGE 2 TASKS
  {
    id: 'prediction',
    name: 'Prediction Drills (≥3 weekly)',
    category: 'prediction',
    stage: 2,
    frequency: 'weekly',
    dayModeAvailability: ['green', 'yellow'],
    weight: 20,
    order: 1
  },
  {
    id: 'emotional-control',
    name: 'Emotional Control Exposure',
    category: 'emotional',
    stage: 2,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 20,
    order: 2
  },
  {
    id: 'influence-daily',
    name: 'Influence Micro-Test',
    category: 'influence',
    stage: 2,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 25,
    order: 3
  },
  {
    id: 'influence-reflection',
    name: 'Weekly Influence Reflection',
    category: 'influence',
    stage: 2,
    frequency: 'weekly',
    dayModeAvailability: ['green', 'yellow'],
    weight: 5,
    order: 4
  },
  {
    id: 'influence-theme',
    name: 'Monthly Theme Progress',
    category: 'influence',
    stage: 2,
    frequency: 'monthly',
    dayModeAvailability: ['green', 'yellow'],
    weight: 10,
    order: 5
  },
  {
    id: 'physical-continue',
    name: 'Physical Continuation (4-5×/week)',
    category: 'training',
    stage: 2,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 10,
    order: 6
  },
  {
    id: 'systematic-learning',
    name: 'Systematic Learning (1 tactic/week)',
    category: 'microskill',
    stage: 2,
    frequency: 'weekly',
    dayModeAvailability: ['green', 'yellow'],
    weight: 5,
    order: 7
  },
  {
    id: 'journaling-s2',
    name: 'Journaling / Logs (5×/week)',
    category: 'journaling',
    stage: 2,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 5,
    order: 8
  },
  
  // STAGE 3 TASKS
  {
    id: 'failure-cycle',
    name: 'Failure Cycle (Weekly)',
    category: 'failure',
    stage: 3,
    frequency: 'weekly',
    dayModeAvailability: ['green', 'yellow'],
    weight: 20,
    order: 1
  },
  {
    id: 'chaos-adaptation',
    name: 'Chaos Adaptation (2×/week)',
    category: 'chaos',
    stage: 3,
    frequency: 'weekly',
    dayModeAvailability: ['green', 'yellow'],
    weight: 20,
    order: 2
  },
  {
    id: 'mission-simulation',
    name: 'Mission Simulation (Monthly)',
    category: 'mission',
    stage: 3,
    frequency: 'monthly',
    dayModeAvailability: ['green', 'yellow'],
    weight: 20,
    order: 3
  },
  {
    id: 'influence-expansion',
    name: 'Influence Expansion (Ongoing)',
    category: 'influence',
    stage: 3,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 20,
    order: 4
  },
  {
    id: 'physical-maintenance',
    name: 'Physical Maintenance (5×/week)',
    category: 'training',
    stage: 3,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 10,
    order: 5
  },
  {
    id: 'ultimate-journaling',
    name: 'Ultimate Journaling (5×/week)',
    category: 'journaling',
    stage: 3,
    frequency: 'daily',
    dayModeAvailability: ['green', 'yellow'],
    weight: 10,
    order: 6
  }
];

// ==================== WORKOUT SCHEDULE ====================

export const WORKOUT_SCHEDULE: WorkoutDay[] = [
  {
    day: 'Monday',
    focus: 'Strength & Core',
    exercises: [
      { name: 'Decline Push-ups', sets: 4, reps: '12-15', restSeconds: 60 },
      { name: 'Diamond Push-ups', sets: 3, reps: '10-12', restSeconds: 60 },
      { name: 'Bulgarian Split Squats', sets: 3, reps: '12/leg', restSeconds: 90 },
      { name: 'Plank → Shoulder Tap', sets: 3, reps: '20 taps', restSeconds: 45 },
      { name: 'Hollow Body Hold', sets: 3, reps: '30-40s', restSeconds: 60 }
    ]
  },
  {
    day: 'Tuesday',
    focus: 'Endurance & Agility',
    exercises: [
      { name: 'Burpees', sets: 4, reps: '12-15', restSeconds: 60 },
      { name: 'High Knees', sets: 3, reps: '40s', restSeconds: 30 },
      { name: 'Jump Squats', sets: 3, reps: '15-20', restSeconds: 60 },
      { name: 'Mountain Climbers', sets: 3, reps: '40s', restSeconds: 30 },
      { name: 'Sprint Intervals', sets: 8, reps: '20s sprint / 40s walk', restSeconds: 0 }
    ]
  },
  {
    day: 'Wednesday',
    focus: 'Core & Stability',
    exercises: [
      { name: 'Side Plank Hip Dips', sets: 3, reps: '10-12/side', restSeconds: 45 },
      { name: 'V-Ups', sets: 3, reps: '15', restSeconds: 45 },
      { name: 'Bird Dogs', sets: 3, reps: '12/side', restSeconds: 45 },
      { name: 'Flutter Kicks', sets: 3, reps: '30s', restSeconds: 30 },
      { name: 'Superman Hold', sets: 3, reps: '30s', restSeconds: 45 }
    ]
  },
  {
    day: 'Thursday',
    focus: 'Strength & Plyometrics',
    exercises: [
      { name: 'Archer Push-ups', sets: 3, reps: '8/side', restSeconds: 90 },
      { name: 'Pistol Squats', sets: 3, reps: '8/leg', restSeconds: 90 },
      { name: 'Clap Push-ups', sets: 3, reps: '8-10', restSeconds: 90 },
      { name: 'Jump Lunges', sets: 3, reps: '10/leg', restSeconds: 60 },
      { name: 'Side-to-Side Bounds', sets: 3, reps: '15/side', restSeconds: 60 }
    ]
  },
  {
    day: 'Friday',
    focus: 'Mental Toughness + Conditioning',
    exercises: [
      { name: 'Burpees', sets: 3, reps: '45s work', restSeconds: 15 },
      { name: 'Plank-to-Push-up', sets: 3, reps: '45s work', restSeconds: 15 },
      { name: 'Squat Pulses', sets: 3, reps: '45s work', restSeconds: 15 },
      { name: 'Jumping Lunges', sets: 3, reps: '45s work', restSeconds: 15 },
      { name: 'Side Plank Hold', sets: 3, reps: '45s work', restSeconds: 15 }
    ]
  },
  {
    day: 'Saturday',
    focus: 'Active Recovery',
    exercises: [
      { name: 'Light Walk', sets: 1, reps: '20-30 min', restSeconds: 0 },
      { name: 'Stretching', sets: 1, reps: '15 min', restSeconds: 0 }
    ]
  },
  {
    day: 'Sunday',
    focus: 'Active Recovery',
    exercises: [
      { name: 'Light Walk', sets: 1, reps: '20-30 min', restSeconds: 0 },
      { name: 'Stretching', sets: 1, reps: '15 min', restSeconds: 0 }
    ]
  }
];

// ==================== QUOTES ====================

export const QUOTES: Quote[] = [
  // Solo Leveling Style
  { text: 'I alone level up.', author: 'Sung Jinwoo', category: 'solo-leveling' },
  { text: 'The strong do not need to prove their strength.', author: 'System', category: 'solo-leveling' },
  { text: 'Arise.', author: 'System', category: 'solo-leveling' },
  { text: 'Your shadow army grows stronger with each victory.', author: 'System', category: 'solo-leveling' },
  { text: 'Defeat is merely a stepping stone to greater power.', author: 'Sung Jinwoo', category: 'solo-leveling' },
  { text: 'The dungeon does not forgive hesitation.', author: 'System', category: 'solo-leveling' },
  { text: 'Level up required to proceed.', author: 'System', category: 'solo-leveling' },
  { text: 'Your potential is limitless.', author: 'System', category: 'solo-leveling' },
  { text: 'Shadows never die. They only wait.', author: 'Beru', category: 'solo-leveling' },
  { text: 'True strength comes from within.', author: 'System', category: 'solo-leveling' },
  
  // COTE Style
  { text: 'The only way to guarantee failure is to never try.', author: 'Ayanokoji Kiyotaka', category: 'cote' },
  { text: 'Tools are meant to be used.', author: 'Ayanokoji Kiyotaka', category: 'cote' },
  { text: 'Victory goes to those who prepare.', author: 'Ayanokoji Kiyotaka', category: 'cote' },
  { text: 'Emotions are a liability in the face of logic.', author: 'Ayanokoji Kiyotaka', category: 'cote' },
  { text: 'Observe. Analyze. Execute.', author: 'Ayanokoji Kiyotaka', category: 'cote' },
  { text: 'The classroom is a battlefield.', author: 'Ayanokoji Kiyotaka', category: 'cote' },
  { text: 'Every person has a price.', author: 'Ayanokoji Kiyotaka', category: 'cote' },
  { text: 'Information is the most valuable currency.', author: 'Ayanokoji Kiyotaka', category: 'cote' },
  { text: 'Trust no one. Verify everything.', author: 'Ayanokoji Kiyotaka', category: 'cote' },
  { text: 'The summit is lonely by design.', author: 'Ayanokoji Kiyotaka', category: 'cote' }
];

// ==================== ACHIEVEMENTS ====================

export const ACHIEVEMENTS = [
  {
    id: 'streak-7',
    name: '7-Day Discipline',
    description: 'Maintain a 7-day completion streak',
    icon: 'flame',
    condition: { type: 'streak' as const, days: 7 }
  },
  {
    id: 'streak-30',
    name: 'Month of Steel',
    description: 'Maintain a 30-day completion streak',
    icon: 'zap',
    condition: { type: 'streak' as const, days: 30 }
  },
  {
    id: 'first-weekly-pass',
    name: 'First Victory',
    description: 'Pass your first week',
    icon: 'trophy',
    condition: { type: 'weekly_pass' as const, count: 1 }
  },
  {
    id: 'observation-80',
    name: 'Keen Eye',
    description: 'Achieve 80% observation accuracy',
    icon: 'eye',
    condition: { type: 'accuracy' as const, skill: 'observation', percent: 80 }
  },
  {
    id: 'first-mission',
    name: 'Mission Complete',
    description: 'Complete your first mission',
    icon: 'target',
    condition: { type: 'mission_rank' as const, rank: 'E' }
  },
  {
    id: 's-rank-mission',
    name: 'S-Rank Hunter',
    description: 'Complete an S-Rank mission',
    icon: 'crown',
    condition: { type: 'mission_rank' as const, rank: 'S' }
  },
  {
    id: 'training-100',
    name: 'Body as Weapon',
    description: 'Complete 100 training sessions',
    icon: 'dumbbell',
    condition: { type: 'training_count' as const, count: 100 }
  },
  {
    id: 'prediction-master',
    name: 'Prediction Master',
    description: 'Achieve 70% prediction accuracy',
    icon: 'brain',
    condition: { type: 'accuracy' as const, skill: 'prediction', percent: 70 }
  },
  {
    id: 'level-10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: 'star',
    condition: { type: 'level' as const, level: 10 }
  },
  {
    id: 'level-50',
    name: 'Shadow Monarch',
    description: 'Reach level 50',
    icon: 'crown',
    condition: { type: 'level' as const, level: 50 }
  }
];

// ==================== INFLUENCE THEMES ====================

export const INFLUENCE_THEMES = [
  {
    month: 1,
    theme: 'framing' as const,
    name: 'Framing',
    description: 'Present options so your choice feels natural; reorder info; loss vs gain framing',
    drills: ['Reframe a request 3 different ways', 'Practice loss aversion framing', 'Use contrast principle']
  },
  {
    month: 2,
    theme: 'mirroring' as const,
    name: 'Rapport & Mirroring',
    description: 'Subtle body/voice pacing, shared language, warmth calibration',
    drills: ['Mirror body language subtly', 'Match speech pace and tone', 'Find common ground quickly']
  },
  {
    month: 3,
    theme: 'seeding' as const,
    name: 'Seeding Ideas',
    description: 'Plant a thought that resurfaces as theirs (time-lag effect)',
    drills: ['Plant an idea and wait 7 days', 'Use "I wonder if..." statements', 'Create curiosity gaps']
  },
  {
    month: 4,
    theme: 'leadership' as const,
    name: 'Subtle Leadership',
    description: 'Guide group: agenda shaping, quiet summarizing, credit-sharing',
    drills: ['Summarize and redirect meetings', 'Give credit to build allies', 'Shape agendas subtly']
  }
];

// ==================== XP REWARDS ====================

export const XP_REWARDS = {
  taskComplete: 10,
  workoutComplete: 25,
  observationLogged: 15,
  predictionResolved: 20,
  influenceSuccess: 15,
  missionComplete: 100,
  journalEntry: 10,
  dailyQuest: 30,
  streakBonus: 5,
  levelUpBonus: 50
};

// ==================== DAY MODE CONFIG ====================

export const DAY_MODE_CONFIG = {
  green: {
    name: 'Green Day',
    description: 'Full Mode - All systems operational',
    color: '#10B981',
    tasksAvailable: 'all',
    xpMultiplier: 1.0
  },
  yellow: {
    name: 'Yellow Day',
    description: 'Reduced Mode - Core tasks only',
    color: '#F59E0B',
    tasksAvailable: 'core',
    xpMultiplier: 0.7
  },
  red: {
    name: 'Red Day',
    description: 'Minimum Viable Mode - Anchors only',
    color: '#EF4444',
    tasksAvailable: 'anchors',
    xpMultiplier: 0.4
  }
};

// ==================== TAB CONFIGURATION ====================

export const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  { id: 'tasks', label: 'Tasks', icon: 'check-square' },
  { id: 'stats', label: 'Stats', icon: 'bar-chart-2' },
  { id: 'missions', label: 'Missions', icon: 'sword' },
  { id: 'music', label: 'Music', icon: 'music' }
];

// ==================== POMODORO PRESETS ====================

export const POMODORO_PRESETS = [
  { name: 'Standard', work: 25, break: 5 },
  { name: 'Deep Work', work: 50, break: 10 },
  { name: 'Sprint', work: 15, break: 3 },
  { name: 'Custom', work: 0, break: 0 }
];

// ==================== MISSION RANKS ====================

export const MISSION_RANKS: Record<string, { min: number; max: number; color: string; label: string }> = {
  E: { min: 0, max: 40, color: '#6B7280', label: 'E-Rank' },
  D: { min: 41, max: 55, color: '#22C55E', label: 'D-Rank' },
  C: { min: 56, max: 70, color: '#3B82F6', label: 'C-Rank' },
  B: { min: 71, max: 80, color: '#8B5CF6', label: 'B-Rank' },
  A: { min: 81, max: 90, color: '#F59E0B', label: 'A-Rank' },
  S: { min: 91, max: 100, color: '#EF4444', label: 'S-Rank' }
};
