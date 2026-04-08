// Hybrid System: Ayanokoji × Jinwoo - Type Definitions

// ==================== CORE SYSTEM TYPES ====================

export type Stage = 1 | 2 | 3;

export type DayMode = 'green' | 'yellow' | 'red';

export type ThemeType = 'cote' | 'solo-leveling' | 'hybrid';

export interface UserProfile {
  id: string;
  username: string;
  currentStage: Stage;
  currentWeek: number;
  wakeTimeTarget: string;
  trainingIntensity: 'beginner' | 'intermediate' | 'advanced';
  defaultDayMode: DayMode;
  theme: ThemeType;
  hardcoreMode: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  createdAt: Date;
  lastActive: Date;
}

// ==================== XP & LEVELING ====================

export interface XPData {
  id?: string;
  currentXP: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
}

export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  bonusUnlocked?: string;
}

// ==================== STREAK SYSTEM ====================

export interface StreakData {
  id?: string;
  dailyStreak: number;
  weeklyStreak: number;
  stageStreak: number;
  lastCompletedDate: Date | null;
  recoveryTokens: number;
}

// ==================== DAILY TASKS ====================

export interface DailyTask {
  id: string;
  name: string;
  category: 'wake' | 'training' | 'observation' | 'microskill' | 'journaling' | 'phone' | 'prediction' | 'emotional' | 'influence' | 'failure' | 'chaos' | 'mission';
  stage: Stage;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayModeAvailability: DayMode[];
  weight: number;
  order: number;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  date: Date;
  completed: boolean;
  notes?: string;
  xpEarned: number;
}

export interface DayModeRecord {
  id: string;
  date: Date;
  mode: DayMode;
}

// ==================== WORKOUT MODULE ====================

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutSession {
  id: string;
  date: Date;
  dayOfWeek: string;
  exercises: CompletedExercise[];
  totalDuration: number;
  xpEarned: number;
  notes?: string;
}

export interface CompletedExercise {
  exerciseName: string;
  setsCompleted: number;
  repsPerSet: number[];
  weight?: number;
}

// ==================== OBSERVATION MODULE ====================

export interface ObservationLog {
  id: string;
  date: Date;
  environment: string;
  objectiveFacts: string;
  microBehaviors: string;
  inference: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  verificationResult?: 'correct' | 'wrong' | 'unknown';
  isDeepDrill: boolean;
  duration: number;
}

export interface WeeklyDeepObservation {
  id: string;
  weekNumber: number;
  date: Date;
  targetPerson?: string;
  maskVsLeakage: string;
  conversationSummary: string;
  accuracy: number;
  notes: string;
}

// ==================== PREDICTION MODULE (STAGE 2) ====================

export interface Prediction {
  id: string;
  createdAt: Date;
  statement: string;
  expectedOutcomeDate: Date;
  confidence: 1 | 2 | 3 | 4 | 5;
  result?: 'correct' | 'wrong' | 'partial';
  outcomeNotes?: string;
  resolvedAt?: Date;
  isLocked: boolean;
}

// ==================== INFLUENCE MODULE (STAGE 2) ====================

export type InfluenceTactic = 'framing' | 'mirroring' | 'seeding' | 'leadership';

export interface InfluenceAttempt {
  id: string;
  date: Date;
  targetCategory: string;
  tactic: InfluenceTactic;
  result: 'success' | 'fail' | 'partial';
  notes?: string;
}

export interface WeeklyInfluenceReflection {
  id: string;
  weekNumber: number;
  date: Date;
  summary: string;
  lessonsLearned: string;
  successRate: number;
}

export interface MonthlyThemeProgress {
  id: string;
  month: number;
  theme: InfluenceTactic;
  completionPercent: number;
  drillsCompleted: number;
}

export interface IdeaAdoption {
  id: string;
  date: Date;
  idea: string;
  adopted: boolean;
  adoptionDate?: Date;
}

// ==================== FAILURE CYCLE MODULE (STAGE 3) ====================

export interface FailureCycle {
  id: string;
  challenge: string;
  attemptDate: Date;
  attemptResult: 'failed' | 'partial' | 'success';
  postMortem: string;
  patchPlan: string;
  reAttemptDate?: Date;
  reAttemptResult?: 'failed' | 'partial' | 'success';
  bounceBackHours: number;
}

// ==================== CHAOS ADAPTATION (STAGE 3) ====================

export interface ChaosExposure {
  id: string;
  date: Date;
  environment: string;
  actorsMapped: string;
  alliancesIdentified: string;
  calmMaintained: boolean;
  notes: string;
}

// ==================== MISSION SYSTEM (STAGE 3) ====================

export type MissionRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface Mission {
  id: string;
  name: string;
  description: string;
  plannedDate: Date;
  executedDate?: Date;
  planningScore: number;
  executionScore: number;
  outcomeScore: number;
  debriefScore: number;
  totalScore: number;
  rank: MissionRank;
  insights: string;
  status: 'planned' | 'in-progress' | 'completed';
}

// ==================== JOURNAL MODULE ====================

export interface JournalEntry {
  id: string;
  date: Date;
  whatIDid: string;
  whatChanged: string;
  oneImprovement: string;
  mood: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  linkedTasks: string[];
}

// ==================== ACHIEVEMENTS ====================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
}

export type AchievementCondition = 
  | { type: 'streak'; days: number }
  | { type: 'weekly_pass'; count: number }
  | { type: 'accuracy'; skill: string; percent: number }
  | { type: 'mission_rank'; rank: MissionRank }
  | { type: 'training_count'; count: number }
  | { type: 'level'; level: number };

export interface UnlockedAchievement {
  id: string;
  achievementId: string;
  unlockedAt: Date;
}

// ==================== STATS & ATTRIBUTES ====================

export interface RPGAttributes {
  strength: number;
  perception: number;
  intelligence: number;
  charisma: number;
  discipline: number;
  adaptability: number;
}

export interface WeeklyStats {
  weekNumber: number;
  stage: Stage;
  compliancePercent: number;
  stageScore: number;
  passed: boolean;
  metrics: Record<string, number>;
}

// ==================== MUSIC PLAYER ====================

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  duration: number;
  filePath: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: string[];
}

// ==================== NOTIFICATIONS ====================

export interface NotificationSetting {
  id: string;
  type: 'wake' | 'training' | 'observation' | 'journaling' | 'weekly' | 'mission';
  enabled: boolean;
  time: string;
}

// ==================== SYSTEM QUEST ====================

export interface SystemQuest {
  id: string;
  date: Date;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  completedAt?: Date;
}

// ==================== SETTINGS & EXPORT ====================

export interface AppSettings {
  theme: ThemeType;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  hardcoreMode: boolean;
  manualStageOverride: boolean;
}

export interface ExportData {
  profile: UserProfile;
  taskCompletions: TaskCompletion[];
  workoutSessions: WorkoutSession[];
  observationLogs: ObservationLog[];
  predictions: Prediction[];
  influenceAttempts: InfluenceAttempt[];
  failureCycles: FailureCycle[];
  chaosExposures: ChaosExposure[];
  missions: Mission[];
  journalEntries: JournalEntry[];
  achievements: UnlockedAchievement[];
  xpData: XPData;
  streakData: StreakData;
  weeklyStats: WeeklyStats[];
  exportedAt: Date;
}

// ==================== SCORING ====================

export interface StageWeights {
  [key: string]: number;
}

export interface Stage1Weights extends StageWeights {
  wakeTime: number;
  training: number;
  observationDaily: number;
  observationWeekly: number;
  journaling: number;
  phoneBoundary: number;
  microSkill: number;
}

export interface Stage2Weights extends StageWeights {
  predictionAccuracy: number;
  emotionalControl: number;
  influenceDaily: number;
  influenceReflection: number;
  influenceTheme: number;
  physical: number;
  learning: number;
  journaling: number;
}

export interface Stage3Weights extends StageWeights {
  failureCycles: number;
  chaosAdaptation: number;
  mission: number;
  influenceAdoption: number;
  physical: number;
  systemLog: number;
}

// ==================== UI COMPONENTS ====================

export interface TabItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface Quote {
  text: string;
  author: string;
  category: 'solo-leveling' | 'cote';
}
