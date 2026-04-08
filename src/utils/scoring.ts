// Hybrid System Scoring Engine
import type { Stage } from '@/types';
import { 
  STAGE_1_WEIGHTS, 
  STAGE_2_WEIGHTS, 
  STAGE_3_WEIGHTS,
  STAGE_CONFIG,
  ALL_TASKS
} from '@/constants';
import { db } from '@/db';

// ==================== WEEKLY SCORE CALCULATION ====================

interface WeeklyMetrics {
  wakeTime: number;
  training: number;
  observationDaily: number;
  observationWeekly: number;
  journaling: number;
  phoneBoundary: number;
  microSkill: number;
  predictionAccuracy: number;
  emotionalControl: number;
  influenceDaily: number;
  influenceReflection: number;
  influenceTheme: number;
  physical: number;
  learning: number;
  failureCycles: number;
  chaosAdaptation: number;
  mission: number;
  influenceAdoption: number;
  systemLog: number;
}

export async function calculateWeeklyScore(
  weekNumber: number,
  stage: Stage
): Promise<{ score: number; passed: boolean; metrics: Partial<WeeklyMetrics> }> {
  const weekStart = getWeekStartDate(weekNumber);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  let score = 0;
  const metrics: Partial<WeeklyMetrics> = {};
  
  switch (stage) {
    case 1: {
      const stage1Result = await calculateStage1Score(weekStart, weekEnd);
      score = stage1Result.score;
      Object.assign(metrics, stage1Result.metrics);
      break;
    }
    case 2: {
      const stage2Result = await calculateStage2Score(weekStart, weekEnd);
      score = stage2Result.score;
      Object.assign(metrics, stage2Result.metrics);
      break;
    }
    case 3: {
      const stage3Result = await calculateStage3Score(weekStart, weekEnd);
      score = stage3Result.score;
      Object.assign(metrics, stage3Result.metrics);
      break;
    }
  }
  
  const passThreshold = STAGE_CONFIG[stage].passThreshold;
  const passed = score >= passThreshold;
  
  return { score: Math.round(score), passed, metrics };
}

// ==================== STAGE 1 SCORING ====================

async function calculateStage1Score(weekStart: Date, weekEnd: Date) {
  const metrics: Partial<WeeklyMetrics> = {};
  
  // Get all task completions for the week
  const completions = await db.getCompletionsForDateRange(weekStart, weekEnd);
  
  // Calculate wake time compliance (7 days)
  const wakeCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.category === 'wake' && c.completed;
  });
  metrics.wakeTime = (wakeCompletions.length / 7) * 100;
  
  // Calculate training compliance (Mon-Fri = 5 days)
  const trainingDays = getWeekdayCount(weekStart, weekEnd);
  const trainingCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.category === 'training' && c.completed;
  });
  metrics.training = (trainingCompletions.length / trainingDays) * 100;
  
  // Calculate observation daily compliance (7 days)
  const obsDailyCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.id === 'observation-daily' && c.completed;
  });
  metrics.observationDaily = (obsDailyCompletions.length / 7) * 100;
  
  // Get observation logs for accuracy calculation
  const observationLogs = await db.getObservationLogsForDateRange(weekStart, weekEnd);
  const verifiedLogs = observationLogs.filter(l => l.verificationResult !== undefined);
  const correctLogs = verifiedLogs.filter(l => l.verificationResult === 'correct');
  metrics.observationWeekly = verifiedLogs.length > 0 
    ? (correctLogs.length / verifiedLogs.length) * 100 
    : 0;
  
  // Calculate journaling compliance (7 days)
  const journalCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.category === 'journaling' && c.completed;
  });
  metrics.journaling = (journalCompletions.length / 7) * 100;
  
  // Calculate phone boundary compliance
  const phoneCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.category === 'phone' && c.completed;
  });
  metrics.phoneBoundary = (phoneCompletions.length / 7) * 100;
  
  // Calculate micro-skill compliance
  const microCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.category === 'microskill' && c.completed;
  });
  metrics.microSkill = (microCompletions.length / 7) * 100;
  
  // Apply weights
  const score = 
    (metrics.wakeTime * STAGE_1_WEIGHTS.wakeTime) +
    (metrics.training * STAGE_1_WEIGHTS.training) +
    (metrics.observationDaily * STAGE_1_WEIGHTS.observationDaily) +
    (metrics.observationWeekly * STAGE_1_WEIGHTS.observationWeekly) +
    (metrics.journaling * STAGE_1_WEIGHTS.journaling) +
    (metrics.phoneBoundary * STAGE_1_WEIGHTS.phoneBoundary) +
    (metrics.microSkill * STAGE_1_WEIGHTS.microSkill);
  
  return { score, metrics };
}

// ==================== STAGE 2 SCORING ====================

async function calculateStage2Score(weekStart: Date, weekEnd: Date) {
  const metrics: Partial<WeeklyMetrics> = {};
  
  // Get predictions for accuracy
  const predictions = await db.getPredictionsForWeek(weekStart);
  const resolvedPredictions = predictions.filter(p => p.result !== undefined);
  const correctPredictions = resolvedPredictions.filter(p => p.result === 'correct');
  metrics.predictionAccuracy = resolvedPredictions.length > 0
    ? (correctPredictions.length / resolvedPredictions.length) * 100
    : 0;
  
  // Emotional control - from task completions
  const completions = await db.getCompletionsForDateRange(weekStart, weekEnd);
  const emotionalCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.category === 'emotional' && c.completed;
  });
  metrics.emotionalControl = (emotionalCompletions.length / 5) * 100; // 5×/week target
  
  // Influence daily success
  const influenceAttempts = await db.getInfluenceAttemptsForWeek(weekStart);
  const successfulInfluence = influenceAttempts.filter(a => a.result === 'success');
  metrics.influenceDaily = influenceAttempts.length > 0
    ? (successfulInfluence.length / influenceAttempts.length) * 100
    : 0;
  
  // Influence reflection (weekly)
  const reflectionCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.id === 'influence-reflection' && c.completed;
  });
  metrics.influenceReflection = reflectionCompletions.length > 0 ? 100 : 0;
  
  // Influence theme progress (monthly - simplified)
  const themeProgress = await db.themeProgress.toArray();
  const currentMonthProgress = themeProgress.filter(p => p.month === new Date().getMonth() + 1);
  metrics.influenceTheme = currentMonthProgress.length > 0
    ? currentMonthProgress.reduce((sum, p) => sum + p.completionPercent, 0) / currentMonthProgress.length
    : 0;
  
  // Physical continuation (4-5×/week)
  const physicalCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.category === 'training' && c.completed;
  });
  metrics.physical = (physicalCompletions.length / 5) * 100;
  
  // Systematic learning (weekly)
  const learningCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.id === 'systematic-learning' && c.completed;
  });
  metrics.learning = learningCompletions.length > 0 ? 100 : 0;
  
  // Journaling (5×/week)
  const journalCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.category === 'journaling' && c.completed;
  });
  metrics.journaling = (journalCompletions.length / 5) * 100;
  
  // Apply weights
  const score =
    (metrics.predictionAccuracy * STAGE_2_WEIGHTS.predictionAccuracy) +
    (metrics.emotionalControl * STAGE_2_WEIGHTS.emotionalControl) +
    (metrics.influenceDaily * STAGE_2_WEIGHTS.influenceDaily) +
    (metrics.influenceReflection * STAGE_2_WEIGHTS.influenceReflection) +
    (metrics.influenceTheme * STAGE_2_WEIGHTS.influenceTheme) +
    (metrics.physical * STAGE_2_WEIGHTS.physical) +
    (metrics.learning * STAGE_2_WEIGHTS.learning) +
    (metrics.journaling * STAGE_2_WEIGHTS.journaling);
  
  return { score, metrics };
}

// ==================== STAGE 3 SCORING ====================

async function calculateStage3Score(weekStart: Date, weekEnd: Date) {
  const metrics: Partial<WeeklyMetrics> = {};
  
  // Failure cycles (weekly)
  const failureCycles = await db.failureCycles
    .where('attemptDate')
    .between(weekStart, weekEnd)
    .toArray();
  metrics.failureCycles = failureCycles.length > 0 ? 100 : 0;
  
  // Chaos adaptation (2×/week)
  const chaosExposures = await db.chaosExposures
    .where('date')
    .between(weekStart, weekEnd)
    .toArray();
  const calmExposures = chaosExposures.filter(e => e.calmMaintained);
  metrics.chaosAdaptation = chaosExposures.length > 0
    ? (calmExposures.length / chaosExposures.length) * 100
    : 0;
  
  // Mission score (use latest mission)
  const missions = await db.missions
    .where('executedDate')
    .between(weekStart, weekEnd)
    .toArray();
  const latestMission = missions.sort((a, b) => 
    (b.executedDate?.getTime() || 0) - (a.executedDate?.getTime() || 0)
  )[0];
  metrics.mission = latestMission?.totalScore || 0;
  
  // Influence adoption rate
  const ideaAdoptions = await db.ideaAdoptions
    .where('date')
    .between(weekStart, weekEnd)
    .toArray();
  const adopted = ideaAdoptions.filter(a => a.adopted);
  metrics.influenceAdoption = ideaAdoptions.length > 0
    ? (adopted.length / ideaAdoptions.length) * 100
    : 0;
  
  // Physical maintenance (5×/week)
  const completions = await db.getCompletionsForDateRange(weekStart, weekEnd);
  const physicalCompletions = completions.filter(c => {
    const task = getTaskById(c.taskId);
    return task?.category === 'training' && c.completed;
  });
  metrics.physical = (physicalCompletions.length / 5) * 100;
  
  // System log (5×/week)
  const journalEntries = await db.journalEntries
    .where('date')
    .between(weekStart, weekEnd)
    .toArray();
  metrics.systemLog = (journalEntries.length / 5) * 100;
  
  // Apply weights
  const score =
    (metrics.failureCycles * STAGE_3_WEIGHTS.failureCycles) +
    (metrics.chaosAdaptation * STAGE_3_WEIGHTS.chaosAdaptation) +
    (metrics.mission * STAGE_3_WEIGHTS.mission) +
    (metrics.influenceAdoption * STAGE_3_WEIGHTS.influenceAdoption) +
    (metrics.physical * STAGE_3_WEIGHTS.physical) +
    (metrics.systemLog * STAGE_3_WEIGHTS.systemLog);
  
  return { score, metrics };
}

// ==================== HELPER FUNCTIONS ====================

function getWeekStartDate(weekNumber: number): Date {
  // Assuming program starts on a specific date
  const programStart = new Date('2024-01-01'); // This should come from profile
  const weekStart = new Date(programStart);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);
  return weekStart;
}

function getWeekdayCount(weekStart: Date, weekEnd: Date): number {
  let count = 0;
  const current = new Date(weekStart);
  while (current < weekEnd) {
    const day = current.getDay();
    if (day >= 1 && day <= 5) count++; // Mon-Fri
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function getTaskById(taskId: string) {
  return ALL_TASKS.find((t) => t.id === taskId);
}

// ==================== DAILY COMPLETION ====================

export async function calculateDailyCompletion(date: Date, stage: Stage): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const completions = await db.getCompletionsForDateRange(startOfDay, endOfDay);
  const dayMode = await db.getDayModeForDate(date);
  
  // Get tasks for current stage and day mode
  const stageTasks = ALL_TASKS.filter((t) => 
    t.stage === stage && 
    t.frequency === 'daily' &&
    t.dayModeAvailability.includes(dayMode?.mode || 'green')
  );
  
  if (stageTasks.length === 0) return 0;
  
  const completedCount = stageTasks.filter((task) =>
    completions.some(c => c.taskId === task.id && c.completed)
  ).length;
  
  return Math.round((completedCount / stageTasks.length) * 100);
}

// ==================== STAGE PROGRESS ====================

export function calculateStageProgress(currentWeek: number, stage: Stage): number {
  const config = STAGE_CONFIG[stage];
  const stageWeeks = config.weeks.end - config.weeks.start + 1;
  const weeksInStage = Math.max(0, currentWeek - config.weeks.start + 1);
  return Math.min(100, Math.round((weeksInStage / stageWeeks) * 100));
}

// ==================== MISSION RANK ====================

export function calculateMissionRank(score: number): { rank: string; color: string } {
  if (score >= 91) return { rank: 'S', color: '#ef4444' };
  if (score >= 81) return { rank: 'A', color: '#f59e0b' };
  if (score >= 71) return { rank: 'B', color: '#8b5cf6' };
  if (score >= 56) return { rank: 'C', color: '#3b82f6' };
  if (score >= 41) return { rank: 'D', color: '#22c55e' };
  return { rank: 'E', color: '#6b7280' };
}

// ==================== ATTRIBUTE CALCULATION ====================

export async function calculateAttributes() {
  const [
    workoutCount,
    observationCount,
    predictionCount,
    influenceCount,
    missionCount,
    xpData
  ] = await Promise.all([
    db.workoutSessions.count(),
    db.observationLogs.count(),
    db.predictions.count(),
    db.influenceAttempts.count(),
    db.missions.count(),
    db.xpData.toArray()
  ]);
  
  const level = xpData[0]?.level || 1;
  
  return {
    strength: Math.min(100, 10 + Math.floor(workoutCount * 0.5) + level),
    perception: Math.min(100, 10 + Math.floor(observationCount * 0.3) + Math.floor(level * 0.5)),
    intelligence: Math.min(100, 10 + Math.floor(predictionCount * 0.5) + Math.floor(level * 0.5)),
    charisma: Math.min(100, 10 + Math.floor(influenceCount * 0.4) + Math.floor(level * 0.5)),
    discipline: Math.min(100, 10 + level * 2 + Math.floor(workoutCount * 0.2)),
    adaptability: Math.min(100, 10 + Math.floor(missionCount * 2) + Math.floor(level * 0.5))
  };
}
