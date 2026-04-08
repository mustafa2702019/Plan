// Daily Tasks Page
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { db } from '@/db';
import { ALL_TASKS, DAY_MODE_CONFIG } from '@/constants';
import type { DailyTask, DayMode } from '@/types';
import { 
  Check, 
  Sun, 
  Cloud, 
  AlertTriangle,
  ChevronDown,
  Calendar
} from 'lucide-react';

export function DailyTasks() {
  const { profile, completeTask, uncompleteTask } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayMode, setDayMode] = useState<DayMode>('green');
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [showDayModeSelector, setShowDayModeSelector] = useState(false);

  const stage = profile?.currentStage || 1;

  const loadTasks = useCallback(async () => {
    // Get day mode for selected date
    const mode = await db.getDayModeForDate(selectedDate);
    const currentMode = mode?.mode || 'green';
    setDayMode(currentMode);

    // Filter tasks for current stage and day mode
    const stageTasks = ALL_TASKS.filter(task => 
      task.stage === stage && 
      task.frequency === 'daily' &&
      task.dayModeAvailability.includes(currentMode)
    ).sort((a, b) => a.order - b.order);

    // Get completions for selected date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const taskCompletions = await db.getCompletionsForDateRange(startOfDay, endOfDay);
    const completionMap: Record<string, boolean> = {};
    taskCompletions.forEach(tc => {
      completionMap[tc.taskId] = tc.completed;
    });

    setTasks(stageTasks);
    setCompletions(completionMap);
  }, [selectedDate, stage]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const toggleTask = async (taskId: string) => {
    const isCompleted = completions[taskId];
    
    if (isCompleted) {
      await uncompleteTask(taskId, selectedDate);
      setCompletions(prev => ({ ...prev, [taskId]: false }));
    } else {
      await completeTask(taskId, selectedDate);
      setCompletions(prev => ({ ...prev, [taskId]: true }));
    }
  };

  const setDayModeForDate = async (mode: DayMode) => {
    const existing = await db.getDayModeForDate(selectedDate);
    
    if (existing) {
      await db.dayModes.update(existing.id, { mode });
    } else {
      await db.dayModes.add({
        id: crypto.randomUUID(),
        date: selectedDate,
        mode
      });
    }
    
    setDayMode(mode);
    setShowDayModeSelector(false);
    void loadTasks();
  };

  const getDayModeIcon = () => {
    switch (dayMode) {
      case 'green': return <Sun className="w-5 h-5 text-emerald-400" />;
      case 'yellow': return <Cloud className="w-5 h-5 text-amber-400" />;
      case 'red': return <AlertTriangle className="w-5 h-5 text-red-400" />;
    }
  };

  const getDayModeColor = () => {
    switch (dayMode) {
      case 'green': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'yellow': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'red': return 'text-red-400 border-red-500/30 bg-red-500/10';
    }
  };

  const completedCount = Object.values(completions).filter(Boolean).length;
  const completionPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
          <span className="text-[var(--primary)]">DAILY</span>
          <span className="text-[var(--text)]"> PROTOCOL</span>
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Stage {stage} Tasks • {completedCount}/{tasks.length} Completed
        </p>
      </motion.header>

      {/* Date & Day Mode Selector */}
      <motion.div
        className="flex gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Date Picker */}
        <div className="flex-1 glass rounded-xl p-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--primary)]" />
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="bg-transparent text-[var(--text)] text-sm outline-none flex-1"
            />
          </div>
        </div>

        {/* Day Mode Selector */}
        <button
          onClick={() => setShowDayModeSelector(!showDayModeSelector)}
          className={`glass rounded-xl px-4 py-3 flex items-center gap-2 border ${getDayModeColor()}`}
        >
          {getDayModeIcon()}
          <span className="text-sm font-medium capitalize">{dayMode}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showDayModeSelector ? 'rotate-180' : ''}`} />
        </button>
      </motion.div>

      {/* Day Mode Dropdown */}
      <AnimatePresence>
        {showDayModeSelector && (
          <motion.div
            className="glass rounded-xl p-3 mb-4 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {(['green', 'yellow', 'red'] as DayMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setDayModeForDate(mode)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  dayMode === mode 
                    ? 'bg-[var(--primary)]/20 border border-[var(--primary)]/40' 
                    : 'hover:bg-white/5'
                }`}
              >
                {mode === 'green' && <Sun className="w-5 h-5 text-emerald-400" />}
                {mode === 'yellow' && <Cloud className="w-5 h-5 text-amber-400" />}
                {mode === 'red' && <AlertTriangle className="w-5 h-5 text-red-400" />}
                <div className="text-left">
                  <p className="text-sm font-medium text-[var(--text)] capitalize">
                    {DAY_MODE_CONFIG[mode].name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {DAY_MODE_CONFIG[mode].description}
                  </p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <motion.div
        className="glass rounded-xl p-4 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[var(--text-muted)]">Daily Progress</span>
          <span className="text-lg font-bold text-[var(--primary)]">{completionPercent}%</span>
        </div>
        <div className="h-3 bg-black/40 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Tasks List */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {tasks.map((task, index) => {
          const isCompleted = completions[task.id];
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <button
                onClick={() => isToday && toggleTask(task.id)}
                disabled={!isToday}
                className={`w-full glass rounded-xl p-4 flex items-center gap-4 transition-all ${
                  isCompleted 
                    ? 'bg-[var(--success)]/10 border-[var(--success)]/30' 
                    : 'hover:border-[var(--primary)]/40'
                } ${!isToday ? 'opacity-70' : ''}`}
              >
                {/* Checkbox */}
                <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-[var(--success)] border-[var(--success)]'
                    : 'border-[var(--border)]'
                }`}>
                  {isCompleted && <Check className="w-4 h-4 text-white" />}
                </div>

                {/* Task Info */}
                <div className="flex-1 text-left">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'
                  }`}>
                    {task.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {task.category} • {task.weight}% weight
                  </p>
                </div>

                {/* XP Badge */}
                {!isCompleted && (
                  <span className="text-xs text-[var(--primary)] font-mono">
                    +10 XP
                  </span>
                )}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <motion.div
          className="glass rounded-xl p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-[var(--text-muted)]">No tasks available for this day mode</p>
        </motion.div>
      )}

      {/* Not Today Warning */}
      {!isToday && (
        <motion.div
          className="fixed bottom-24 left-4 right-4 glass rounded-xl p-4 border border-amber-500/30 bg-amber-500/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <p className="text-sm text-amber-400">
              Viewing past/future date. Tasks cannot be modified.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
