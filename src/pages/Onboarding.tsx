// Onboarding Page
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/db';
import type { UserProfile, DayMode, ThemeType } from '@/types';
import { 
  ChevronRight, 
  User, 
  Target, 
  Clock, 
  Dumbbell, 
  Sun,
  Zap,
  Check
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    username: '',
    currentStage: 1,
    currentWeek: 1,
    wakeTimeTarget: '06:30',
    trainingIntensity: 'intermediate',
    defaultDayMode: 'green',
    theme: 'hybrid',
    hardcoreMode: false,
    soundEnabled: true,
    vibrationEnabled: true,
    notificationsEnabled: true
  });

  const steps = [
    { title: 'Welcome', icon: Zap },
    { title: 'Profile', icon: User },
    { title: 'Settings', icon: Target },
    { title: 'Ready', icon: Check }
  ];

  const createProfile = async () => {
    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      username: profile.username || 'Hunter',
      currentStage: profile.currentStage || 1,
      currentWeek: profile.currentWeek || 1,
      wakeTimeTarget: profile.wakeTimeTarget || '06:30',
      trainingIntensity: profile.trainingIntensity || 'intermediate',
      defaultDayMode: profile.defaultDayMode || 'green',
      theme: profile.theme || 'hybrid',
      hardcoreMode: profile.hardcoreMode || false,
      soundEnabled: profile.soundEnabled ?? true,
      vibrationEnabled: profile.vibrationEnabled ?? true,
      notificationsEnabled: profile.notificationsEnabled ?? true,
      createdAt: new Date(),
      lastActive: new Date()
    };

    await db.profile.add(newProfile);
    onComplete();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 30px rgba(0, 217, 255, 0.3)',
                  '0 0 60px rgba(0, 217, 255, 0.5)',
                  '0 0 30px rgba(0, 217, 255, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Zap className="w-12 h-12 text-white" />
            </motion.div>
            
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              <span className="text-[var(--primary)]">HYBRID</span>
              <span className="text-[var(--text)]"> SYSTEM</span>
            </h1>
            <p className="text-lg text-[var(--text-muted)] mb-2">
              Ayanokoji × Jinwoo
            </p>
            <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
              A real-life RPG productivity system combining strategic discipline with leveling mechanics.
            </p>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold text-[var(--text)] mb-6">Create Your Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--text-muted)] mb-2 block">Hunter Name</label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  placeholder="Enter your name..."
                  className="w-full"
                />
              </div>

              <div className="p-3 rounded-lg bg-black/20 border border-[var(--border)]">
                <p className="text-sm text-[var(--text-muted)]">Starting Stage</p>
                <p className="text-base text-[var(--primary)] font-semibold">Stage 1 - Foundation</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Stage progression is locked and must be earned by gate criteria.
                </p>
                <div className="mt-2 space-y-1 text-[11px] text-[var(--text-muted)]">
                  <p>Early exit check: end of Week 5 or Week 6.</p>
                  <p>Need 2 consecutive weeks meeting all thresholds:</p>
                  <p>- Overall &gt;= 85%, daily observation accuracy &gt;= 80%, deep drill &gt;= 80%</p>
                  <p>- Training &gt;= 90%, journaling &gt;= 90%, phone & micro-skill &gt;= 80%</p>
                  <p>- Wake-time &gt;= 70% (trend to 90%)</p>
                  <p>Weeks 1-5 also require 2+ observation environments and at least one off day with next-day recovery.</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--text-muted)] mb-2 block">Wake Time Target</label>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[var(--primary)]" />
                  <input
                    type="time"
                    value={profile.wakeTimeTarget}
                    onChange={(e) => setProfile({ ...profile, wakeTimeTarget: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-xl font-bold text-[var(--text)] mb-6">System Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--text-muted)] mb-2 block">Training Intensity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => setProfile({ ...profile, trainingIntensity: intensity })}
                      className={`p-3 rounded-lg border transition-all capitalize ${
                        profile.trainingIntensity === intensity
                          ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--primary)]'
                          : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/40'
                      }`}
                    >
                      <Dumbbell className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs">{intensity}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--text-muted)] mb-2 block">Default Day Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'green', label: 'Green', icon: Sun, color: 'text-emerald-400' },
                    { value: 'yellow', label: 'Yellow', icon: Sun, color: 'text-amber-400' },
                    { value: 'red', label: 'Red', icon: Sun, color: 'text-red-400' }
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setProfile({ ...profile, defaultDayMode: mode.value as DayMode })}
                      className={`p-3 rounded-lg border transition-all ${
                        profile.defaultDayMode === mode.value
                          ? 'border-[var(--primary)] bg-[var(--primary)]/20'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/40'
                      }`}
                    >
                      <mode.icon className={`w-5 h-5 mx-auto mb-1 ${mode.color}`} />
                      <span className={`text-xs ${mode.color}`}>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--text-muted)] mb-2 block">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cote', label: 'COTE', color: '#c9a227' },
                    { value: 'solo-leveling', label: 'Solo', color: '#00d9ff' },
                    { value: 'hybrid', label: 'Hybrid', color: '#00f5d4' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setProfile({ ...profile, theme: theme.value as ThemeType })}
                      className={`p-3 rounded-lg border transition-all ${
                        profile.theme === theme.value
                          ? 'border-[var(--primary)] bg-[var(--primary)]/20'
                          : 'border-[var(--border)] hover:border-[var(--primary)]/40'
                      }`}
                    >
                      <div 
                        className="w-4 h-4 rounded-full mx-auto mb-1"
                        style={{ background: theme.color }}
                      />
                      <span className="text-xs text-[var(--text)]">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                <span className="text-sm text-[var(--text)]">Hardcore Mode</span>
                <button
                  onClick={() => setProfile({ ...profile, hardcoreMode: !profile.hardcoreMode })}
                  className={`w-12 h-6 rounded-full transition-all ${
                    profile.hardcoreMode ? 'bg-[var(--danger)]' : 'bg-[var(--surface)]'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white"
                    animate={{ x: profile.hardcoreMode ? 24 : 2 }}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--success)] to-emerald-600 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Check className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
              System Initialized
            </h2>
            <p className="text-sm text-[var(--text-muted)] mb-6">
              Welcome, {profile.username || 'Hunter'}. Your journey begins now.
            </p>

            <motion.button
              onClick={createProfile}
              className="px-8 py-4 rounded-xl font-bold text-white text-lg"
              style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ENTER SYSTEM
            </motion.button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-8 left-0 right-0 flex justify-center gap-2 z-10">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs transition-all ${
              i === step
                ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                : i < step
                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                : 'bg-[var(--surface)] text-[var(--text-muted)]'
            }`}
          >
            <s.icon className="w-3 h-3" />
            {s.title}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl p-6 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          {step < 3 && (
            <div className="mt-auto pt-6 flex justify-between">
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => setStep(step + 1)}
                className="ml-auto px-6 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] flex items-center gap-2 hover:bg-[var(--primary)]/30 transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="fixed bottom-4 text-xs text-[var(--text-muted)]">
        Hybrid System v1.0 • Ayanokoji × Jinwoo
      </p>
    </div>
  );
}
