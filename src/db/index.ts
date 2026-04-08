// Hybrid System Database - Dexie.js IndexedDB Setup
import Dexie from 'dexie';
import type { Table } from 'dexie';
import type {
  UserProfile, TaskCompletion, DayModeRecord, WorkoutSession,
  ObservationLog, WeeklyDeepObservation, Prediction, InfluenceAttempt,
  WeeklyInfluenceReflection, MonthlyThemeProgress, IdeaAdoption,
  FailureCycle, ChaosExposure, Mission, JournalEntry,
  UnlockedAchievement, WeeklyStats, MusicTrack, Playlist,
  NotificationSetting, SystemQuest, XPData, StreakData
} from '@/types';

export class HybridSystemDB extends Dexie {
  // Tables
  profile!: Table<UserProfile, string>;
  taskCompletions!: Table<TaskCompletion, string>;
  dayModes!: Table<DayModeRecord, string>;
  workoutSessions!: Table<WorkoutSession, string>;
  observationLogs!: Table<ObservationLog, string>;
  deepObservations!: Table<WeeklyDeepObservation, string>;
  predictions!: Table<Prediction, string>;
  influenceAttempts!: Table<InfluenceAttempt, string>;
  influenceReflections!: Table<WeeklyInfluenceReflection, string>;
  themeProgress!: Table<MonthlyThemeProgress, string>;
  ideaAdoptions!: Table<IdeaAdoption, string>;
  failureCycles!: Table<FailureCycle, string>;
  chaosExposures!: Table<ChaosExposure, string>;
  missions!: Table<Mission, string>;
  journalEntries!: Table<JournalEntry, string>;
  achievements!: Table<UnlockedAchievement, string>;
  weeklyStats!: Table<WeeklyStats, number>;
  musicTracks!: Table<MusicTrack, string>;
  playlists!: Table<Playlist, string>;
  notifications!: Table<NotificationSetting, string>;
  systemQuests!: Table<SystemQuest, string>;
  xpData!: Table<XPData, string>;
  streakData!: Table<StreakData, string>;

  constructor() {
    super('HybridSystemDB');
    
    this.version(1).stores({
      profile: 'id',
      taskCompletions: 'id, [taskId+date], date',
      dayModes: 'id, date',
      workoutSessions: 'id, date',
      observationLogs: 'id, date, [date+isDeepDrill]',
      deepObservations: 'id, weekNumber, date',
      predictions: 'id, createdAt, expectedOutcomeDate, isLocked',
      influenceAttempts: 'id, date, tactic',
      influenceReflections: 'id, weekNumber, date',
      themeProgress: 'id, month, theme',
      ideaAdoptions: 'id, date, adopted',
      failureCycles: 'id, attemptDate, reAttemptDate',
      chaosExposures: 'id, date',
      missions: 'id, plannedDate, executedDate, status',
      journalEntries: 'id, date',
      achievements: 'id, achievementId, unlockedAt',
      weeklyStats: 'weekNumber, stage',
      musicTracks: 'id',
      playlists: 'id',
      notifications: 'id, type',
      systemQuests: 'id, date, completed',
      xpData: 'id',
      streakData: 'id'
    });
  }

  // ==================== HELPER METHODS ====================

  async getTaskCompletionForDate(taskId: string, date: Date): Promise<TaskCompletion | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.taskCompletions
      .where('date')
      .between(startOfDay, endOfDay)
      .filter(tc => tc.taskId === taskId)
      .first();
  }

  async getCompletionsForDateRange(startDate: Date, endDate: Date): Promise<TaskCompletion[]> {
    return this.taskCompletions
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }

  async getDayModeForDate(date: Date): Promise<DayModeRecord | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.dayModes
      .where('date')
      .between(startOfDay, endOfDay)
      .first();
  }

  async getObservationLogsForDateRange(startDate: Date, endDate: Date): Promise<ObservationLog[]> {
    return this.observationLogs
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }

  async getPredictionsForWeek(weekStart: Date): Promise<Prediction[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return this.predictions
      .where('createdAt')
      .between(weekStart, weekEnd)
      .toArray();
  }

  async getInfluenceAttemptsForWeek(weekStart: Date): Promise<InfluenceAttempt[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return this.influenceAttempts
      .where('date')
      .between(weekStart, weekEnd)
      .toArray();
  }

  async getJournalForDate(date: Date): Promise<JournalEntry | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return this.journalEntries
      .where('date')
      .between(startOfDay, endOfDay)
      .first();
  }

  async getWorkoutsForWeek(weekStart: Date): Promise<WorkoutSession[]> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return this.workoutSessions
      .where('date')
      .between(weekStart, weekEnd)
      .toArray();
  }

  async getWeeklyStats(weekNumber: number): Promise<WeeklyStats | undefined> {
    return this.weeklyStats.where('weekNumber').equals(weekNumber).first();
  }

  async getAllAchievements(): Promise<UnlockedAchievement[]> {
    return this.achievements.toArray();
  }

  async exportAllData() {
    const [
      profile,
      taskCompletions,
      dayModes,
      workoutSessions,
      observationLogs,
      deepObservations,
      predictions,
      influenceAttempts,
      influenceReflections,
      themeProgress,
      ideaAdoptions,
      failureCycles,
      chaosExposures,
      missions,
      journalEntries,
      achievements,
      weeklyStats,
      musicTracks,
      playlists,
      notifications,
      systemQuests,
      xpData,
      streakData
    ] = await Promise.all([
      this.profile.toArray(),
      this.taskCompletions.toArray(),
      this.dayModes.toArray(),
      this.workoutSessions.toArray(),
      this.observationLogs.toArray(),
      this.deepObservations.toArray(),
      this.predictions.toArray(),
      this.influenceAttempts.toArray(),
      this.influenceReflections.toArray(),
      this.themeProgress.toArray(),
      this.ideaAdoptions.toArray(),
      this.failureCycles.toArray(),
      this.chaosExposures.toArray(),
      this.missions.toArray(),
      this.journalEntries.toArray(),
      this.achievements.toArray(),
      this.weeklyStats.toArray(),
      this.musicTracks.toArray(),
      this.playlists.toArray(),
      this.notifications.toArray(),
      this.systemQuests.toArray(),
      this.xpData.toArray(),
      this.streakData.toArray()
    ]);

    return {
      profile: profile[0] || null,
      taskCompletions,
      dayModes,
      workoutSessions,
      observationLogs,
      deepObservations,
      predictions,
      influenceAttempts,
      influenceReflections,
      themeProgress,
      ideaAdoptions,
      failureCycles,
      chaosExposures,
      missions,
      journalEntries,
      achievements,
      weeklyStats,
      musicTracks,
      playlists,
      notifications,
      systemQuests,
      xpData: xpData[0] || null,
      streakData: streakData[0] || null,
      exportedAt: new Date()
    };
  }

  async importAllData(data: Awaited<ReturnType<HybridSystemDB['exportAllData']>>) {
    await this.transaction('rw', this.allTables, async () => {
      // Clear all tables
      await Promise.all(this.allTables.map(table => table.clear()));
      
      // Import data
      if (data.profile) await this.profile.add(data.profile);
      if (data.taskCompletions?.length) await this.taskCompletions.bulkAdd(data.taskCompletions);
      if (data.dayModes?.length) await this.dayModes.bulkAdd(data.dayModes);
      if (data.workoutSessions?.length) await this.workoutSessions.bulkAdd(data.workoutSessions);
      if (data.observationLogs?.length) await this.observationLogs.bulkAdd(data.observationLogs);
      if (data.deepObservations?.length) await this.deepObservations.bulkAdd(data.deepObservations);
      if (data.predictions?.length) await this.predictions.bulkAdd(data.predictions);
      if (data.influenceAttempts?.length) await this.influenceAttempts.bulkAdd(data.influenceAttempts);
      if (data.influenceReflections?.length) await this.influenceReflections.bulkAdd(data.influenceReflections);
      if (data.themeProgress?.length) await this.themeProgress.bulkAdd(data.themeProgress);
      if (data.ideaAdoptions?.length) await this.ideaAdoptions.bulkAdd(data.ideaAdoptions);
      if (data.failureCycles?.length) await this.failureCycles.bulkAdd(data.failureCycles);
      if (data.chaosExposures?.length) await this.chaosExposures.bulkAdd(data.chaosExposures);
      if (data.missions?.length) await this.missions.bulkAdd(data.missions);
      if (data.journalEntries?.length) await this.journalEntries.bulkAdd(data.journalEntries);
      if (data.achievements?.length) await this.achievements.bulkAdd(data.achievements);
      if (data.weeklyStats?.length) await this.weeklyStats.bulkAdd(data.weeklyStats);
      if (data.musicTracks?.length) await this.musicTracks.bulkAdd(data.musicTracks);
      if (data.playlists?.length) await this.playlists.bulkAdd(data.playlists);
      if (data.notifications?.length) await this.notifications.bulkAdd(data.notifications);
      if (data.systemQuests?.length) await this.systemQuests.bulkAdd(data.systemQuests);
      if (data.xpData) await this.xpData.add(data.xpData);
      if (data.streakData) await this.streakData.add(data.streakData);
    });
  }

  get allTables() {
    return [
      this.profile, this.taskCompletions, this.dayModes, this.workoutSessions,
      this.observationLogs, this.deepObservations, this.predictions,
      this.influenceAttempts, this.influenceReflections, this.themeProgress,
      this.ideaAdoptions, this.failureCycles, this.chaosExposures,
      this.missions, this.journalEntries, this.achievements, this.weeklyStats,
      this.musicTracks, this.playlists, this.notifications, this.systemQuests,
      this.xpData, this.streakData
    ];
  }
}

export const db = new HybridSystemDB();

// Initialize default data
export async function initializeDatabase() {
  const profile = await db.profile.toArray();
  
  if (profile.length === 0) {
    // Create default XP data
    await db.xpData.add({
      id: 'default',
      currentXP: 0,
      totalXP: 0,
      level: 1,
      xpToNextLevel: 100
    });
    
    // Create default streak data
    await db.streakData.add({
      id: 'default',
      dailyStreak: 0,
      weeklyStreak: 0,
      stageStreak: 0,
      lastCompletedDate: null,
      recoveryTokens: 0
    });
    
    // Create default notification settings
    const defaultNotifications: NotificationSetting[] = [
      { id: 'wake', type: 'wake', enabled: true, time: '06:30' },
      { id: 'training', type: 'training', enabled: true, time: '07:00' },
      { id: 'observation', type: 'observation', enabled: true, time: '12:00' },
      { id: 'journaling', type: 'journaling', enabled: true, time: '21:00' },
      { id: 'weekly', type: 'weekly', enabled: true, time: '20:00' },
      { id: 'mission', type: 'mission', enabled: true, time: '09:00' }
    ];
    await db.notifications.bulkAdd(defaultNotifications);
  }
}
