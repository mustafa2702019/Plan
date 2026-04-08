// Hybrid System Store - Zustand Global State
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateDailyCompletion, calculateWeeklyScore } from '@/utils/scoring';
import type { 
  UserProfile, XPData, StreakData, Stage, DayMode, ThemeType,
  TaskCompletion, WeeklyStats, RPGAttributes
} from '@/types';
import { db, initializeDatabase } from '@/db';

// ==================== STORE STATE ====================

const getProgramWeekRange = (weekNumber: number) => {
  const programStart = new Date('2024-01-01');
  const weekStart = new Date(programStart);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  return { weekStart, weekEnd };
};

interface AppState {
  // Core data
  profile: UserProfile | null;
  xpData: XPData | null;
  streakData: StreakData | null;
  
  // UI State
  currentTab: string;
  isLoading: boolean;
  showLevelUp: boolean;
  showAchievement: string | null;
  showStageUnlock: boolean;
  
  // Temporary states
  levelUpData: { oldLevel: number; newLevel: number } | null;
  newStageData: { from: Stage; to: Stage } | null;
  
  // Computed values (cached)
  currentWeek: number;
  weeklyCompliance: number;
  stageScore: number;
  attributes: RPGAttributes;
}

interface AppActions {
  // Initialization
  initialize: () => Promise<void>;
  setProfile: (profile: UserProfile) => Promise<void>;
  
  // XP & Leveling
  addXP: (amount: number) => Promise<void>;
  checkLevelUp: () => Promise<boolean>;
  dismissLevelUp: () => void;
  
  // Tasks
  completeTask: (taskId: string, date: Date, notes?: string) => Promise<void>;
  uncompleteTask: (taskId: string, date: Date) => Promise<void>;
  
  // Day Mode
  setDayMode: (date: Date, mode: DayMode) => Promise<void>;
  getDayMode: (date: Date) => Promise<DayMode>;
  
  // Stage Management
  checkStageAdvancement: () => Promise<void>;
  dismissStageUnlock: () => void;
  forceStage: (stage: Stage) => Promise<void>;
  
  // Streak
  updateStreak: (date: Date) => Promise<void>;
  useRecoveryToken: () => Promise<boolean>;
  
  // Stats
  calculateWeeklyStats: (weekNumber: number) => Promise<WeeklyStats>;
  updateAttributes: () => Promise<void>;
  
  // UI
  setCurrentTab: (tab: string) => void;
  setTheme: (theme: ThemeType) => Promise<void>;
  updateProfileSettings: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Data
  exportData: () => Promise<string>;
  importData: (jsonData: string) => Promise<void>;
  resetProgress: () => Promise<void>;
}

// ==================== XP CALCULATION ====================

const XP_FOR_LEVEL = (level: number): number => {
  return Math.floor(100 * Math.pow(1.1, level - 1));
};

// ==================== DEFAULT ATTRIBUTES ====================

const DEFAULT_ATTRIBUTES: RPGAttributes = {
  strength: 10,
  perception: 10,
  intelligence: 10,
  charisma: 10,
  discipline: 10,
  adaptability: 10
};

// ==================== STORE CREATION ====================

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      xpData: null,
      streakData: null,
      currentTab: 'dashboard',
      isLoading: true,
      showLevelUp: false,
      showAchievement: null,
      showStageUnlock: false,
      levelUpData: null,
      newStageData: null,
      currentWeek: 1,
      weeklyCompliance: 0,
      stageScore: 0,
      attributes: DEFAULT_ATTRIBUTES,

      // ==================== INITIALIZATION ====================
      
      initialize: async () => {
        try {
          await initializeDatabase();
          
          const [profile, xpData, streakData] = await Promise.all([
            db.profile.toArray(),
            db.xpData.toArray(),
            db.streakData.toArray()
          ]);
          
          const profileData = profile[0] || null;
          const xpDataItem = xpData[0] || { id: 'default', currentXP: 0, totalXP: 0, level: 1, xpToNextLevel: 100 };
          const streakDataItem = streakData[0] || { id: 'default', dailyStreak: 0, weeklyStreak: 0, stageStreak: 0, lastCompletedDate: null, recoveryTokens: 0 };
          
          // Calculate current week from profile start date or default to 1
          let currentWeek = 1;
          if (profileData?.createdAt) {
            const startDate = new Date(profileData.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - startDate.getTime());
            const inferredWeek = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
            currentWeek = Math.min(52, Math.max(1, profileData.currentWeek || inferredWeek));
          }
          
          set({
            profile: profileData,
            xpData: xpDataItem,
            streakData: streakDataItem,
            currentWeek,
            isLoading: false
          });
          
          // Update attributes based on progress
          await get().updateAttributes();
        } catch (error) {
          console.error('Failed to initialize app store', error);
          set({ isLoading: false });
        }
      },

      setProfile: async (profile) => {
        await db.profile.clear();
        await db.profile.add(profile);
        set({ profile });
      },

      // ==================== XP & LEVELING ====================
      
      addXP: async (amount) => {
        const { xpData } = get();
        if (!xpData) return;
        
        const newXP = xpData.currentXP + amount;
        const newTotalXP = xpData.totalXP + amount;
        
        await db.xpData.update(xpData.id || 'default', {
          currentXP: newXP,
          totalXP: newTotalXP
        });
        
        set({
          xpData: {
            ...xpData,
            currentXP: newXP,
            totalXP: newTotalXP
          }
        });
        
        // Check for level up
        await get().checkLevelUp();
      },

      checkLevelUp: async () => {
        const { xpData } = get();
        if (!xpData) return false;
        
        const xpNeeded = XP_FOR_LEVEL(xpData.level);
        
        if (xpData.currentXP >= xpNeeded) {
          const newLevel = xpData.level + 1;
          const remainingXP = xpData.currentXP - xpNeeded;
          const nextLevelXP = XP_FOR_LEVEL(newLevel);
          
          await db.xpData.update(xpData.id || 'default', {
            level: newLevel,
            currentXP: remainingXP,
            xpToNextLevel: nextLevelXP
          });
          
          set({
            xpData: {
              ...xpData,
              level: newLevel,
              currentXP: remainingXP,
              xpToNextLevel: nextLevelXP
            },
            showLevelUp: true,
            levelUpData: { oldLevel: xpData.level, newLevel: newLevel }
          });
          
          // Update attributes on level up
          await get().updateAttributes();
          
          return true;
        }
        
        return false;
      },

      dismissLevelUp: () => {
        set({ showLevelUp: false, levelUpData: null });
      },

      // ==================== TASKS ====================
      
      completeTask: async (taskId, date, notes) => {
        const taskCompletion: TaskCompletion = {
          id: crypto.randomUUID(),
          taskId,
          date,
          completed: true,
          notes,
          xpEarned: 10
        };
        
        await db.taskCompletions.add(taskCompletion);
        await get().addXP(10);
        await get().updateStreak(date);
        await get().updateAttributes();
      },

      uncompleteTask: async (taskId, date) => {
        const existing = await db.getTaskCompletionForDate(taskId, date);
        if (existing) {
          await db.taskCompletions.delete(existing.id);
          await get().updateAttributes();
        }
      },

      // ==================== DAY MODE ====================
      
      setDayMode: async (date, mode) => {
        const existing = await db.getDayModeForDate(date);
        
        if (existing) {
          await db.dayModes.update(existing.id, { mode });
        } else {
          await db.dayModes.add({
            id: crypto.randomUUID(),
            date,
            mode
          });
        }
      },

      getDayMode: async (date) => {
        const record = await db.getDayModeForDate(date);
        return record?.mode || 'green';
      },

      // ==================== STAGE MANAGEMENT ====================
      
      checkStageAdvancement: async () => {
        const { profile, currentWeek } = get();
        if (!profile) return;
        
        const currentStage = profile.currentStage;
        
        // Get last 2 weeks of stats
        const week1Stats = await db.getWeeklyStats(currentWeek - 1);
        const week2Stats = await db.getWeeklyStats(currentWeek - 2);
        
        if (!week1Stats || !week2Stats) return;
        
        // Check if both weeks passed
        if (!week1Stats.passed || !week2Stats.passed) return;
        
        let shouldAdvance = false;
        
        switch (currentStage) {
          case 1: {
            // Early graduation (corrected): earliest check at end of Week 5/6,
            // must pass all consistency + variety checks.
            const earliestWeekReached = currentWeek >= 5;
            if (!earliestWeekReached) break;

            const consistencyWeeks =
              (currentWeek === 5 && week1Stats.weekNumber === 5 && week2Stats.weekNumber === 4) ||
              (currentWeek >= 6 && week1Stats.weekNumber === 6 && week2Stats.weekNumber === 5) ||
              (currentWeek > 6 && week1Stats.weekNumber === currentWeek - 1 && week2Stats.weekNumber === currentWeek - 2);

            if (!consistencyWeeks) break;

            const stageScoreOk = week1Stats.stageScore >= 85 && week2Stats.stageScore >= 85;
            const trainingOk = (week1Stats.metrics.training || 0) >= 90 && (week2Stats.metrics.training || 0) >= 90;
            const journalingOk = (week1Stats.metrics.journaling || 0) >= 90 && (week2Stats.metrics.journaling || 0) >= 90;
            const phoneMicroOk =
              ((week1Stats.metrics.phoneBoundary || 0) >= 80 && (week2Stats.metrics.phoneBoundary || 0) >= 80) &&
              ((week1Stats.metrics.microSkill || 0) >= 80 && (week2Stats.metrics.microSkill || 0) >= 80);
            const wakeTrendOk = (week1Stats.metrics.wakeTime || 0) >= 70 && (week2Stats.metrics.wakeTime || 0) >= 70;

            const getDailyObservationAccuracy = async (weekNumber: number) => {
              const { weekStart, weekEnd } = getProgramWeekRange(weekNumber);
              const logs = await db.getObservationLogsForDateRange(weekStart, weekEnd);
              const dailyVerified = logs.filter((log) => !log.isDeepDrill && log.verificationResult !== undefined);
              const dailyCorrect = dailyVerified.filter((log) => log.verificationResult === 'correct');
              return dailyVerified.length > 0 ? (dailyCorrect.length / dailyVerified.length) * 100 : 0;
            };

            const [week1DailyObsAccuracy, week2DailyObsAccuracy] = await Promise.all([
              getDailyObservationAccuracy(week1Stats.weekNumber),
              getDailyObservationAccuracy(week2Stats.weekNumber)
            ]);
            const dailyObservationAccuracyOk = week1DailyObsAccuracy >= 80 && week2DailyObsAccuracy >= 80;

            const deepObsWeek1 = await db.deepObservations.where('weekNumber').equals(week1Stats.weekNumber).toArray();
            const deepObsWeek2 = await db.deepObservations.where('weekNumber').equals(week2Stats.weekNumber).toArray();
            const deepObsAccuracy1 = deepObsWeek1.length > 0
              ? deepObsWeek1.reduce((sum, item) => sum + item.accuracy, 0) / deepObsWeek1.length
              : 0;
            const deepObsAccuracy2 = deepObsWeek2.length > 0
              ? deepObsWeek2.reduce((sum, item) => sum + item.accuracy, 0) / deepObsWeek2.length
              : 0;
            const deepDrillAccuracyOk = deepObsAccuracy1 >= 80 && deepObsAccuracy2 >= 80;

            const { weekStart: week1Start } = getProgramWeekRange(1);
            const { weekEnd: week5End } = getProgramWeekRange(5);
            const logsWeeks1to5 = await db.getObservationLogsForDateRange(week1Start, week5End);
            const uniqueEnvironments = new Set(
              logsWeeks1to5
                .map((log) => log.environment?.trim().toLowerCase())
                .filter((env): env is string => Boolean(env))
            );
            const environmentVarietyOk = uniqueEnvironments.size >= 2;

            const dayModesWeeks1to5 = await db.dayModes.where('date').between(week1Start, week5End).toArray();
            const offDays = dayModesWeeks1to5.filter((mode) => mode.mode === 'red');
            let offDayRecoveryOk = false;
            for (const offDay of offDays) {
              const recoveryDate = new Date(offDay.date);
              recoveryDate.setDate(recoveryDate.getDate() + 1);
              const dayStart = new Date(recoveryDate);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(recoveryDate);
              dayEnd.setHours(23, 59, 59, 999);
              const nextDayCompletions = await db.getCompletionsForDateRange(dayStart, dayEnd);
              if (nextDayCompletions.some((entry) => entry.completed)) {
                offDayRecoveryOk = true;
                break;
              }
            }

            shouldAdvance =
              stageScoreOk &&
              dailyObservationAccuracyOk &&
              deepDrillAccuracyOk &&
              trainingOk &&
              journalingOk &&
              phoneMicroOk &&
              wakeTrendOk &&
              environmentVarietyOk &&
              offDayRecoveryOk;
            break;
          }
          case 2: {
            // Stage 2: score >= 80%, influence >= 60%, prediction >= 70%, emotional >= 85%
            const influenceMetric1 = week1Stats.metrics.influenceDaily || 0;
            const influenceMetric2 = week2Stats.metrics.influenceDaily || 0;
            const predictionMetric1 = week1Stats.metrics.predictionAccuracy || 0;
            const predictionMetric2 = week2Stats.metrics.predictionAccuracy || 0;
            const emotionalMetric1 = week1Stats.metrics.emotionalControl || 0;
            const emotionalMetric2 = week2Stats.metrics.emotionalControl || 0;
            
            shouldAdvance = 
              week1Stats.stageScore >= 80 && week2Stats.stageScore >= 80 &&
              influenceMetric1 >= 60 && influenceMetric2 >= 60 &&
              predictionMetric1 >= 70 && predictionMetric2 >= 70 &&
              emotionalMetric1 >= 85 && emotionalMetric2 >= 85;
            break;
          }
          case 3: {
            // Stage 3: score >= 75%, mission >= 80%, chaos >= 80%, adoption >= 60%
            const missionMetric1 = week1Stats.metrics.mission || 0;
            const missionMetric2 = week2Stats.metrics.mission || 0;
            const chaosMetric1 = week1Stats.metrics.chaosAdaptation || 0;
            const chaosMetric2 = week2Stats.metrics.chaosAdaptation || 0;
            const adoptionMetric1 = week1Stats.metrics.influenceAdoption || 0;
            const adoptionMetric2 = week2Stats.metrics.influenceAdoption || 0;
            
            shouldAdvance = 
              week1Stats.stageScore >= 75 && week2Stats.stageScore >= 75 &&
              missionMetric1 >= 80 && missionMetric2 >= 80 &&
              chaosMetric1 >= 80 && chaosMetric2 >= 80 &&
              adoptionMetric1 >= 60 && adoptionMetric2 >= 60;
            break;
          }
        }
        
        if (shouldAdvance && currentStage < 3) {
          const newStage = (currentStage + 1) as Stage;
          
          await db.profile.update(profile.id, { currentStage: newStage });
          
          set({
            profile: { ...profile, currentStage: newStage },
            showStageUnlock: true,
            newStageData: { from: currentStage, to: newStage }
          });
        }
      },

      dismissStageUnlock: () => {
        set({ showStageUnlock: false, newStageData: null });
      },

      forceStage: async (stage) => {
        const { profile } = get();
        if (!profile) return;
        if (stage > profile.currentStage) return;
        
        await db.profile.update(profile.id, { currentStage: stage });
        set({ profile: { ...profile, currentStage: stage } });
      },

      // ==================== STREAK ====================
      
      updateStreak: async (date) => {
        const { streakData } = get();
        if (!streakData) return;
        
        const lastDate = streakData.lastCompletedDate;
        let newStreak = streakData.dailyStreak;
        
        if (lastDate) {
          const last = new Date(lastDate);
          const today = new Date(date);
          const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            // Streak broken - check for recovery token
            if (streakData.recoveryTokens > 0 && !get().profile?.hardcoreMode) {
              // Use recovery token
              await db.streakData.update(streakData.id || 'default', {
                recoveryTokens: streakData.recoveryTokens - 1
              });
            } else {
              newStreak = 1;
            }
          }
        } else {
          newStreak = 1;
        }
        
        // Add recovery token for high performance weeks
        const newTokens = streakData.recoveryTokens + (newStreak % 7 === 0 ? 1 : 0);
        
        await db.streakData.update(streakData.id || 'default', {
          dailyStreak: newStreak,
          lastCompletedDate: date,
          recoveryTokens: newTokens
        });
        
        set({
          streakData: {
            ...streakData,
            dailyStreak: newStreak,
            lastCompletedDate: date,
            recoveryTokens: newTokens
          }
        });
      },

      useRecoveryToken: async () => {
        const { streakData } = get();
        if (!streakData || streakData.recoveryTokens <= 0) return false;
        
        await db.streakData.update(streakData.id || 'default', {
          recoveryTokens: streakData.recoveryTokens - 1
        });
        
        set({
          streakData: {
            ...streakData,
            recoveryTokens: streakData.recoveryTokens - 1
          }
        });
        
        return true;
      },

      // ==================== STATS ====================
      
      calculateWeeklyStats: async (weekNumber) => {
        const stage = get().profile?.currentStage || 1;
        const { score, passed, metrics } = await calculateWeeklyScore(weekNumber, stage);
        const now = new Date();
        const compliancePercent = await calculateDailyCompletion(now, stage);

        const stats: WeeklyStats = {
          weekNumber,
          stage,
          compliancePercent,
          stageScore: score,
          passed,
          metrics: metrics as Record<string, number>
        };

        await db.weeklyStats.put(stats);
        await get().checkStageAdvancement();
        set({
          weeklyCompliance: compliancePercent,
          stageScore: score
        });

        return stats;
      },

      updateAttributes: async () => {
        const { xpData, profile } = get();
        if (!xpData || !profile) return;
        
        // Calculate attributes based on various metrics
        const workouts = await db.workoutSessions.count();
        const observations = await db.observationLogs.count();
        const predictions = await db.predictions.count();
        const influence = await db.influenceAttempts.count();
        const missions = await db.missions.count();
        
        const allCompletions = await db.taskCompletions.toArray();
        const completedTaskIds = allCompletions.filter((c) => c.completed).map((c) => c.taskId);
        const countByPrefix = (prefix: string) => completedTaskIds.filter((id) => id.includes(prefix)).length;

        const disciplineTasks =
          countByPrefix('wake') +
          countByPrefix('journal') +
          countByPrefix('phone-boundary');
        const strengthTasks = countByPrefix('training') + countByPrefix('physical');
        const perceptionTasks = countByPrefix('observation');
        const intelligenceTasks = countByPrefix('micro-skill') + countByPrefix('systematic-learning') + countByPrefix('prediction');
        const charismaTasks = countByPrefix('influence');
        const adaptabilityTasks = countByPrefix('failure') + countByPrefix('chaos') + countByPrefix('mission');

        const newAttributes: RPGAttributes = {
          strength: Math.min(100, 10 + Math.floor(workouts * 0.5) + Math.floor(strengthTasks * 0.15) + xpData.level),
          perception: Math.min(100, 10 + Math.floor(observations * 0.4) + Math.floor(perceptionTasks * 0.2) + Math.floor(xpData.level * 0.5)),
          intelligence: Math.min(100, 10 + Math.floor(predictions * 0.5) + Math.floor(intelligenceTasks * 0.2) + Math.floor(xpData.level * 0.5)),
          charisma: Math.min(100, 10 + Math.floor(influence * 0.5) + Math.floor(charismaTasks * 0.2) + Math.floor(xpData.level * 0.5)),
          discipline: Math.min(100, 10 + xpData.level * 2 + Math.floor(disciplineTasks * 0.2)),
          adaptability: Math.min(100, 10 + Math.floor(missions * 2) + Math.floor(adaptabilityTasks * 0.25) + Math.floor(xpData.level * 0.5))
        };
        
        set({ attributes: newAttributes });
      },

      // ==================== UI ====================
      
      setCurrentTab: (tab) => {
        set({ currentTab: tab });
      },

      setTheme: async (theme) => {
        const { profile } = get();
        if (!profile) return;
        
        await db.profile.update(profile.id, { theme });
        set({ profile: { ...profile, theme } });
      },

      updateProfileSettings: async (updates) => {
        const { profile } = get();
        if (!profile) return;
        await db.profile.update(profile.id, updates);
        set({ profile: { ...profile, ...updates } });
      },

      // ==================== DATA ====================
      
      exportData: async () => {
        const data = await db.exportAllData();
        return JSON.stringify(data, null, 2);
      },

      importData: async (jsonData) => {
        const data = JSON.parse(jsonData);
        await db.importAllData(data);
        await get().initialize();
      },

      resetProgress: async () => {
        await db.delete();
        window.location.reload();
      }
    }),
    {
      name: 'hybrid-system-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentTab: state.currentTab
      })
    }
  )
);
