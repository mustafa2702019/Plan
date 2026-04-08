// Dashboard Page - System Home
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { db } from '@/db';
import { STAGE_CONFIG, QUOTES, DAY_MODE_CONFIG } from '@/constants';
import type { DayMode } from '@/types';
import { 
  Flame, 
  Target, 
  TrendingUp, 
  Zap
} from 'lucide-react';
import { calculateDailyCompletion } from '@/utils/scoring';

export function Dashboard() {
  const { profile, xpData, streakData, currentWeek, attributes, addXP } = useAppStore();
  const [dailyCompletion, setDailyCompletion] = useState(0);
  const [dayMode, setDayMode] = useState<DayMode>('green');
  const [quote, setQuote] = useState(QUOTES[0]);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [dailyQuest, setDailyQuest] = useState<{ id: string; title: string; completed: boolean; xpReward: number } | null>(null);
  const [weeklyReview, setWeeklyReview] = useState<{ score: number; strengths: string; weakness: string; suggestion: string } | null>(null);

  const stage = profile?.currentStage || 1;
  const stageConfig = STAGE_CONFIG[stage];
  const stageProgress = Math.min(100, Math.round((currentWeek - stageConfig.weeks.start + 1) / (stageConfig.weeks.end - stageConfig.weeks.start + 1) * 100));

  useEffect(() => {
    const loadData = async () => {
      const today = new Date();
      
      // Get daily completion
      const completion = await calculateDailyCompletion(today, stage);
      setDailyCompletion(completion);
      
      // Get day mode
      const mode = await db.getDayModeForDate(today);
      setDayMode(mode?.mode || 'green');
      
      // Get today's tasks
      const { ALL_TASKS } = await import('@/constants');
      const tasks = ALL_TASKS.filter((t: any) => 
        t.stage === stage && 
        t.frequency === 'daily' &&
        t.dayModeAvailability.includes(mode?.mode || 'green')
      );
      
      // Get completions for today
      const completions = await db.getCompletionsForDateRange(
        new Date(today.setHours(0, 0, 0, 0)),
        new Date(today.setHours(23, 59, 59, 999))
      );
      
      const tasksWithStatus = tasks.map((task: any) => ({
        ...task,
        completed: completions.some((c: any) => c.taskId === task.id && c.completed)
      }));
      
      setTodayTasks(tasksWithStatus.slice(0, 6));
      
      // Random quote
      setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

      // Daily quest generator
      const dayKey = new Date().toISOString().split('T')[0];
      const existingQuest = await db.systemQuests.where('date').between(
        new Date(`${dayKey}T00:00:00`),
        new Date(`${dayKey}T23:59:59`)
      ).first();
      if (existingQuest) {
        setDailyQuest({
          id: existingQuest.id,
          title: existingQuest.title,
          completed: existingQuest.completed,
          xpReward: existingQuest.xpReward
        });
      } else {
        const templates = [
          'Observation in a new environment',
          'Training +10% reps challenge',
          'One influence micro-attempt',
          'No phone for first 30 minutes',
          '3-line journal with one strategic insight'
        ];
        const title = templates[Math.floor(Math.random() * templates.length)];
        const quest = {
          id: crypto.randomUUID(),
          date: new Date(),
          title,
          description: title,
          xpReward: 30,
          completed: false
        };
        await db.systemQuests.add(quest);
        setDailyQuest({ id: quest.id, title: quest.title, completed: quest.completed, xpReward: quest.xpReward });
      }

      // Weekly review (Sunday)
      if (new Date().getDay() === 0) {
        const stats = await db.weeklyStats.where('weekNumber').equals(currentWeek).first();
        if (stats) {
          const sorted = Object.entries(stats.metrics || {}).sort((a, b) => b[1] - a[1]);
          const strengths = sorted[0]?.[0] || 'consistency';
          const weakness = sorted[sorted.length - 1]?.[0] || 'execution';
          setWeeklyReview({
            score: Math.round(stats.stageScore),
            strengths,
            weakness,
            suggestion: `Focus next week on raising ${weakness} by 10%.`
          });
        }
      } else {
        setWeeklyReview(null);
      }
    };
    
    loadData();
  }, [stage, currentWeek]);

  const getDayModeColor = () => {
    switch (dayMode) {
      case 'green': return 'text-emerald-400';
      case 'yellow': return 'text-amber-400';
      case 'red': return 'text-red-400';
    }
  };

  const getDayModeBg = () => {
    switch (dayMode) {
      case 'green': return 'bg-emerald-500/20 border-emerald-500/30';
      case 'yellow': return 'bg-amber-500/20 border-amber-500/30';
      case 'red': return 'bg-red-500/20 border-red-500/30';
    }
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs text-[var(--primary)] font-mono mb-1">
          HUNTER: {profile?.username || 'Hunter'}
        </p>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              <span className="text-[var(--primary)]">SYSTEM</span>
              <span className="text-[var(--text)]"> STATUS</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] font-mono">
              Week {currentWeek} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          
          {/* Streak Badge */}
          <div className="flex items-center gap-2 glass rounded-lg px-3 py-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-[var(--text-muted)]">Streak</p>
              <p className="text-lg font-bold leading-none">{streakData?.dailyStreak || 0}</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Stage Banner */}
      <motion.div
        className="glass rounded-xl p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${stageConfig.color}40, ${stageConfig.color}10)`,
                border: `1px solid ${stageConfig.color}60`
              }}
            >
              <span className="text-xl font-bold" style={{ color: stageConfig.color }}>
                S{stage}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text)]">{stageConfig.name}</p>
              <p className="text-xs text-[var(--text-muted)]">
                Weeks {stageConfig.weeks.start}-{stageConfig.weeks.end}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">Progress</p>
            <p className="text-lg font-bold" style={{ color: stageConfig.color }}>
              {stageProgress}%
            </p>
          </div>
        </div>
        
        {/* Stage Progress Bar */}
        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${stageConfig.color}, ${stageConfig.color}80)`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${stageProgress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        </div>
      </motion.div>

      {stage === 1 && (
        <motion.div
          className="glass rounded-xl p-4 mb-4 border border-[var(--primary)]/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-sm font-medium text-[var(--text)] mb-2">Stage 1 Exit Criteria (Early Graduation)</h3>
          <p className="text-xs text-[var(--text-muted)] mb-1">Earliest exit: end of Week 5 or Week 6.</p>
          <p className="text-xs text-[var(--text-muted)]">Need 2 consecutive weeks with:</p>
          <p className="text-xs text-[var(--text-muted)]">- Overall &gt;= 85%, daily observation accuracy &gt;= 80%, deep drill &gt;= 80%</p>
          <p className="text-xs text-[var(--text-muted)]">- Training &gt;= 90%, journaling &gt;= 90%, phone & micro-skill &gt;= 80%</p>
          <p className="text-xs text-[var(--text-muted)]">- Wake-time adherence &gt;= 70% (trend toward 90%)</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Variety (Weeks 1-5): 2+ observation environments, and 1+ off day with next-day recovery.</p>
        </motion.div>
      )}

      {/* XP & Level Card */}
      <motion.div
        className="glass rounded-xl p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Level</p>
              <p className="text-3xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-heading)' }}>
                {xpData?.level || 1}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">Total XP</p>
            <p className="text-xl font-mono text-[var(--primary)]">
              {xpData?.totalXP?.toLocaleString() || 0}
            </p>
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="xp-bar">
          <motion.div
            className="xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${((xpData?.currentXP || 0) / (xpData?.xpToNextLevel || 100)) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[var(--text-muted)] font-mono">{xpData?.currentXP || 0} XP</span>
          <span className="text-xs text-[var(--text-muted)] font-mono">{xpData?.xpToNextLevel || 100} XP</span>
        </div>
      </motion.div>

      {/* Day Mode & Daily Status */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Day Mode */}
        <div className={`glass rounded-xl p-3 border ${getDayModeBg()}`}>
          <div className="flex items-center gap-2 mb-1">
            <Target className={`w-4 h-4 ${getDayModeColor()}`} />
            <span className="text-xs text-[var(--text-muted)]">Day Mode</span>
          </div>
          <p className={`text-lg font-bold capitalize ${getDayModeColor()}`}>
            {dayMode}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">
            {DAY_MODE_CONFIG[dayMode].description}
          </p>
        </div>
        
        {/* Daily Completion */}
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[var(--success)]" />
            <span className="text-xs text-[var(--text-muted)]">Today</span>
          </div>
          <p className="text-lg font-bold text-[var(--success)]">
            {dailyCompletion}%
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">
            Tasks completed
          </p>
        </div>
      </motion.div>

      {/* Today's Tasks Preview */}
      <motion.div
        className="glass rounded-xl p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-[var(--text)]">Today's Protocol</h3>
          <span className="text-xs text-[var(--text-muted)]">
            {todayTasks.filter(t => t.completed).length}/{todayTasks.length}
          </span>
        </div>
        
        <div className="space-y-2">
          {todayTasks.map((task, index) => (
            <motion.div
              key={task.id}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                task.completed ? 'bg-[var(--success)]/10' : 'bg-black/20'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                task.completed 
                  ? 'bg-[var(--success)] border-[var(--success)]' 
                  : 'border-[var(--border)]'
              }`}>
                {task.completed && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-sm flex-1 ${
                task.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'
              }`}>
                {task.name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* RPG Attributes */}
      <motion.div
        className="glass rounded-xl p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-medium text-[var(--text)] mb-3">Attributes</h3>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'strength', label: 'STR', icon: '💪' },
            { key: 'perception', label: 'PER', icon: '👁️' },
            { key: 'intelligence', label: 'INT', icon: '🧠' },
            { key: 'charisma', label: 'CHA', icon: '💫' },
            { key: 'discipline', label: 'DIS', icon: '⚡' },
            { key: 'adaptability', label: 'ADA', icon: '🔄' },
          ].map((attr) => (
            <div key={attr.key} className="text-center p-2 rounded-lg bg-black/20">
              <span className="text-lg">{attr.icon}</span>
              <p className="text-xs text-[var(--text-muted)] mt-1">{attr.label}</p>
              <p className="text-lg font-bold text-[var(--primary)] font-mono">
                {attributes[attr.key as keyof typeof attributes] || 10}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quote */}
      {dailyQuest && (
        <motion.div
          className="glass rounded-xl p-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[var(--text)]">Daily System Quest</h3>
            <span className="text-xs text-[var(--primary)]">+{dailyQuest.xpReward} XP</span>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{dailyQuest.title}</p>
          <button
            disabled={dailyQuest.completed}
            onClick={async () => {
              if (!dailyQuest || dailyQuest.completed) return;
              await db.systemQuests.update(dailyQuest.id, { completed: true, completedAt: new Date() });
              await addXP(dailyQuest.xpReward);
              setDailyQuest({ ...dailyQuest, completed: true });
            }}
            className="mt-3 px-3 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] text-xs disabled:opacity-50"
          >
            {dailyQuest.completed ? 'Quest Completed' : 'Complete Quest'}
          </button>
        </motion.div>
      )}

      {weeklyReview && (
        <motion.div
          className="glass rounded-xl p-4 mb-4 border border-[var(--primary)]/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.58 }}
        >
          <h3 className="text-sm font-medium text-[var(--text)] mb-2">Weekly Review</h3>
          <p className="text-xs text-[var(--text-muted)]">Score: {weeklyReview.score}%</p>
          <p className="text-xs text-[var(--text-muted)]">Strength: {weeklyReview.strengths}</p>
          <p className="text-xs text-[var(--text-muted)]">Weakness: {weeklyReview.weakness}</p>
          <p className="text-xs text-[var(--primary)] mt-1">{weeklyReview.suggestion}</p>
        </motion.div>
      )}

      <motion.div
        className="glass rounded-xl p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm text-[var(--text)] italic leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          — {quote.author}
        </p>
      </motion.div>
    </div>
  );
}
