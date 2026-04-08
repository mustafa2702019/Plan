// Stats Page - Solo Leveling Style Stat Window
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { db } from '@/db';
import { 
  TrendingUp, 
  Activity, 
  Target, 
  Brain,
  Users,
  Zap,
  Dumbbell,
  Eye,
  BookOpen,
  RefreshCw,
  Award
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export function Stats() {
  const { xpData, streakData, attributes, profile, currentWeek } = useAppStore();
  const [weeklyStats, setWeeklyStats] = useState<Array<{ week: string; compliance: number; score: number }>>([]);
  const [skillStats, setSkillStats] = useState({
    observationAccuracy: 0,
    predictionAccuracy: 0,
    influenceSuccess: 0,
    trainingSessions: 0,
    missionsCompleted: 0
  });

  const loadStats = useCallback(async () => {
    // Load weekly stats for chart
    const stats = await db.weeklyStats.toArray();
    const sortedStats = stats.sort((a, b) => a.weekNumber - b.weekNumber).slice(-8);
    setWeeklyStats(sortedStats.map(s => ({
      week: `W${s.weekNumber}`,
      compliance: Math.round(s.compliancePercent),
      score: Math.round(s.stageScore)
    })));

    // Calculate skill stats
    const observations = await db.observationLogs.toArray();
    const verifiedObs = observations.filter(o => o.verificationResult);
    const correctObs = verifiedObs.filter(o => o.verificationResult === 'correct');
    const obsAccuracy = verifiedObs.length > 0 ? (correctObs.length / verifiedObs.length) * 100 : 0;

    const predictions = await db.predictions.toArray();
    const resolvedPreds = predictions.filter(p => p.result);
    const correctPreds = resolvedPreds.filter(p => p.result === 'correct');
    const predAccuracy = resolvedPreds.length > 0 ? (correctPreds.length / resolvedPreds.length) * 100 : 0;

    const influence = await db.influenceAttempts.toArray();
    const successfulInf = influence.filter(i => i.result === 'success');
    const infSuccess = influence.length > 0 ? (successfulInf.length / influence.length) * 100 : 0;

    const workouts = await db.workoutSessions.count();
    const missions = await db.missions.filter(m => m.status === 'completed').count();

    setSkillStats({
      observationAccuracy: Math.round(obsAccuracy),
      predictionAccuracy: Math.round(predAccuracy),
      influenceSuccess: Math.round(infSuccess),
      trainingSessions: workouts,
      missionsCompleted: missions
    });
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  // Radar chart data for attributes
  const attributeData = [
    { subject: 'STR', A: attributes.strength, fullMark: 100 },
    { subject: 'PER', A: attributes.perception, fullMark: 100 },
    { subject: 'INT', A: attributes.intelligence, fullMark: 100 },
    { subject: 'CHA', A: attributes.charisma, fullMark: 100 },
    { subject: 'DIS', A: attributes.discipline, fullMark: 100 },
    { subject: 'ADA', A: attributes.adaptability, fullMark: 100 },
  ];

  const statCards = [
    { 
      label: 'Total XP', 
      value: xpData?.totalXP?.toLocaleString() || 0, 
      icon: Zap,
      color: 'var(--primary)'
    },
    { 
      label: 'Level', 
      value: xpData?.level || 1, 
      icon: Award,
      color: 'var(--warning)'
    },
    { 
      label: 'Daily Streak', 
      value: streakData?.dailyStreak || 0, 
      icon: TrendingUp,
      color: 'var(--success)'
    },
    { 
      label: 'Recovery Tokens', 
      value: streakData?.recoveryTokens || 0, 
      icon: RefreshCw,
      color: 'var(--secondary)'
    },
  ];

  const skillCards = [
    {
      label: 'Observation',
      value: skillStats.observationAccuracy,
      icon: Eye,
      color: '#3b82f6'
    },
    {
      label: 'Prediction',
      value: skillStats.predictionAccuracy,
      icon: Brain,
      color: '#8b5cf6'
    },
    {
      label: 'Influence',
      value: skillStats.influenceSuccess,
      icon: Users,
      color: '#f59e0b'
    },
    {
      label: 'Training',
      value: skillStats.trainingSessions,
      icon: Dumbbell,
      color: '#22c55e',
      suffix: ' sessions'
    }
  ];

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          <span className="text-[var(--primary)]">STAT</span>
          <span className="text-[var(--text)]"> WINDOW</span>
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Hunter Status Report for {profile?.username || 'Hunter'} • Week {currentWeek}
        </p>
      </motion.header>

      {/* Main Stat Card - Solo Leveling Style */}
      <motion.div
        className="glass rounded-2xl p-6 mb-6 border-2"
        style={{ borderColor: 'var(--primary)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Hunter Rank</p>
            <p className="text-3xl font-bold text-[var(--primary)]" style={{ fontFamily: 'var(--font-heading)' }}>
              LEVEL {xpData?.level || 1}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[var(--text-muted)]">Experience</span>
            <span className="text-[var(--primary)] font-mono">
              {xpData?.currentXP || 0} / {xpData?.xpToNextLevel || 100}
            </span>
          </div>
          <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-[var(--border)]">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, var(--primary), var(--accent))'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${((xpData?.currentXP || 0) / (xpData?.xpToNextLevel || 100)) * 100}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
          <div>
            <p className="text-xs text-[var(--text-muted)]">Total XP Earned</p>
            <p className="text-xl font-bold text-[var(--text)] font-mono">
              {xpData?.totalXP?.toLocaleString() || 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">Current Stage</p>
            <p className="text-xl font-bold text-[var(--accent)]">
              Stage {profile?.currentStage || 1}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="glass rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              <span className="text-xs text-[var(--text-muted)]">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color, fontFamily: 'var(--font-mono)' }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Attributes Radar Chart */}
      <motion.div
        className="glass rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-sm font-medium text-[var(--text)] mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--primary)]" />
          Attributes
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={attributeData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar
                name="Attributes"
                dataKey="A"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="var(--primary)"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Attribute Values */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {attributeData.map((attr) => (
            <div key={attr.subject} className="text-center p-2 rounded-lg bg-black/20">
              <p className="text-xs text-[var(--text-muted)]">{attr.subject}</p>
              <p className="text-lg font-bold text-[var(--primary)] font-mono">{attr.A}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Skill Stats */}
      <motion.div
        className="glass rounded-xl p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-medium text-[var(--text)] mb-4 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--primary)]" />
          Skill Mastery
        </h3>
        
        <div className="space-y-4">
          {skillCards.map((skill) => (
            <div key={skill.label} className="flex items-center gap-4">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${skill.color}20` }}
              >
                <skill.icon className="w-5 h-5" style={{ color: skill.color }} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-[var(--text)]">{skill.label}</span>
                  <span className="text-sm font-mono" style={{ color: skill.color }}>
                    {skill.value}{skill.suffix || '%'}
                  </span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: skill.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, skill.value)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Weekly Progress Chart */}
      {weeklyStats.length > 0 && (
        <motion.div
          className="glass rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-sm font-medium text-[var(--text)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
            Weekly Progress
          </h3>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="compliance" 
                  stroke="var(--primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--primary)', strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--accent)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--accent)', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
