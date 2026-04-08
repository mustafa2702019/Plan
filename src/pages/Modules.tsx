import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '@/db';
import { useAppStore } from '@/store';
import { Missions } from '@/pages/Missions';
import type { InfluenceTactic } from '@/types';

type ModuleTab = 'workout' | 'observation' | 'prediction' | 'influence' | 'failure' | 'journal' | 'missions' | 'settings';

const tabs: Array<{ id: ModuleTab; label: string }> = [
  { id: 'workout', label: 'Workout' },
  { id: 'observation', label: 'Observation' },
  { id: 'prediction', label: 'Prediction' },
  { id: 'influence', label: 'Influence' },
  { id: 'failure', label: 'Failure' },
  { id: 'journal', label: 'Journal' },
  { id: 'missions', label: 'Missions' },
  { id: 'settings', label: 'Settings' },
];

export function Modules() {
  const [tab, setTab] = useState<ModuleTab>('workout');
  const { addXP, updateAttributes, profile, setTheme, exportData, importData, resetProgress } = useAppStore();
  const currentStage = profile?.currentStage || 1;
  const isUnlocked = useCallback((tabId: ModuleTab) => {
    if (tabId === 'prediction' || tabId === 'influence') return currentStage >= 2;
    if (tabId === 'failure' || tabId === 'missions') return currentStage >= 3;
    return true;
  }, [currentStage]);

  const content = useMemo(() => {
    if (!isUnlocked(tab)) {
      return (
        <motion.div className="glass rounded-xl p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-[var(--text-muted)]">
            This module is locked. Reach Stage {tab === 'prediction' || tab === 'influence' ? 2 : 3} first.
          </p>
        </motion.div>
      );
    }
    if (tab === 'missions') return <Missions />;
    if (tab === 'workout') return <WorkoutPanel onReward={async () => { await addXP(25); await updateAttributes(); }} />;
    if (tab === 'observation') return <ObservationPanel onReward={async () => { await addXP(15); await updateAttributes(); }} />;
    if (tab === 'prediction') return <PredictionPanel onReward={async () => { await addXP(20); await updateAttributes(); }} />;
    if (tab === 'influence') return <InfluencePanel onReward={async () => { await addXP(15); await updateAttributes(); }} />;
    if (tab === 'failure') return <FailurePanel onReward={async () => { await addXP(20); await updateAttributes(); }} />;
    if (tab === 'journal') return <JournalPanel onReward={async () => { await addXP(10); await updateAttributes(); }} />;
    return (
      <SettingsPanel
        currentTheme={profile?.theme || 'hybrid'}
        onTheme={setTheme}
        onExport={exportData}
        onImport={importData}
        onReset={resetProgress}
      />
    );
  }, [tab, addXP, updateAttributes, profile?.theme, setTheme, exportData, importData, resetProgress, currentStage, isUnlocked]);

  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
        <span className="text-[var(--primary)]">SYSTEM</span> <span className="text-[var(--text)]">MODULES</span>
      </h1>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {tabs.map((t) => {
          const unlocked = isUnlocked(t.id);
          return (
          <button
            key={t.id}
            onClick={() => unlocked && setTab(t.id)}
            disabled={!unlocked}
            className={`text-xs rounded-lg p-2 border ${tab === t.id ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10' : 'border-[var(--border)] text-[var(--text-muted)]'} ${!unlocked ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {t.label}{!unlocked ? ' (Locked)' : ''}
          </button>
        )})}
      </div>
      {content}
    </div>
  );
}

function WorkoutPanel({ onReward }: { onReward: () => Promise<void> }) {
  const [notes, setNotes] = useState('');
  return (
    <motion.div className="glass rounded-xl p-4 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p className="text-sm text-[var(--text-muted)]">Log a workout to boost Strength directly.</p>
      <textarea className="w-full" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Sets / reps / timing..." />
      <button className="px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)]" onClick={async () => {
        await db.workoutSessions.add({ id: crypto.randomUUID(), date: new Date(), dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }), exercises: [], totalDuration: 30, xpEarned: 25, notes });
        await onReward();
        setNotes('');
      }}>Finish Workout (+25 XP)</button>
    </motion.div>
  );
}

function ObservationPanel({ onReward }: { onReward: () => Promise<void> }) {
  const [environment, setEnvironment] = useState('');
  const [inference, setInference] = useState('');
  return (
    <motion.div className="glass rounded-xl p-4 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <input className="w-full" value={environment} onChange={(e) => setEnvironment(e.target.value)} placeholder="Environment / location" />
      <textarea className="w-full" rows={3} value={inference} onChange={(e) => setInference(e.target.value)} placeholder="Inference and reasoning..." />
      <button className="px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)]" onClick={async () => {
        await db.observationLogs.add({ id: crypto.randomUUID(), date: new Date(), environment, objectiveFacts: '', microBehaviors: '', inference, confidence: 3, verificationResult: 'unknown', isDeepDrill: false, duration: 60 });
        await onReward();
        setEnvironment('');
        setInference('');
      }}>Save Observation (+15 XP)</button>
    </motion.div>
  );
}

function PredictionPanel({ onReward }: { onReward: () => Promise<void> }) {
  const [statement, setStatement] = useState('');
  const [predictions, setPredictions] = useState<Array<{ id: string; statement: string; expectedOutcomeDate: Date; result?: 'correct' | 'wrong' | 'partial' }>>([]);

  const loadPredictions = async () => {
    const rows = await db.predictions.orderBy('createdAt').reverse().limit(6).toArray();
    setPredictions(rows.map((p) => ({ id: p.id, statement: p.statement, expectedOutcomeDate: p.expectedOutcomeDate, result: p.result })));
  };

  useEffect(() => {
    void loadPredictions();
  }, []);

  return (
    <motion.div className="glass rounded-xl p-4 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <textarea className="w-full" rows={3} value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Prediction statement..." />
      <button className="px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)]" onClick={async () => {
        const expected = new Date();
        expected.setDate(expected.getDate() + 3);
        await db.predictions.add({ id: crypto.randomUUID(), createdAt: new Date(), statement, expectedOutcomeDate: expected, confidence: 3, isLocked: true });
        await onReward();
        setStatement('');
        await loadPredictions();
      }}>Log Prediction (+20 XP)</button>
      <div className="space-y-2">
        {predictions.map((p) => {
          const locked = !p.result && new Date() < new Date(p.expectedOutcomeDate);
          return (
            <div key={p.id} className="p-2 rounded-lg bg-black/20">
              <p className="text-xs text-[var(--text)]">{p.statement}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Due: {new Date(p.expectedOutcomeDate).toLocaleDateString()}</p>
              {locked ? (
                <p className="text-[10px] text-amber-400">Forecast Locked</p>
              ) : p.result ? (
                <p className="text-[10px] text-emerald-400">Result: {p.result}</p>
              ) : (
                <div className="flex gap-2 mt-1">
                  {(['correct', 'partial', 'wrong'] as const).map((r) => (
                    <button
                      key={r}
                      className="text-[10px] px-2 py-1 rounded bg-[var(--primary)]/20 text-[var(--primary)]"
                      onClick={async () => {
                        await db.predictions.update(p.id, { result: r, resolvedAt: new Date(), isLocked: false });
                        await onReward();
                        await loadPredictions();
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function InfluencePanel({ onReward }: { onReward: () => Promise<void> }) {
  const [target, setTarget] = useState('');
  const [tactic, setTactic] = useState<InfluenceTactic>('framing');
  return (
    <motion.div className="glass rounded-xl p-4 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <input className="w-full" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Target category" />
      <select className="w-full" value={tactic} onChange={(e) => setTactic(e.target.value as InfluenceTactic)}>
        <option value="framing">Framing</option>
        <option value="mirroring">Mirroring</option>
        <option value="seeding">Seeding</option>
        <option value="leadership">Leadership</option>
      </select>
      <button className="px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)]" onClick={async () => {
        await db.influenceAttempts.add({ id: crypto.randomUUID(), date: new Date(), targetCategory: target, tactic, result: 'partial' });
        await onReward();
        setTarget('');
      }}>Log Influence Attempt (+15 XP)</button>
    </motion.div>
  );
}

function FailurePanel({ onReward }: { onReward: () => Promise<void> }) {
  const [challenge, setChallenge] = useState('');
  const [patch, setPatch] = useState('');
  return (
    <motion.div className="glass rounded-xl p-4 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <input className="w-full" value={challenge} onChange={(e) => setChallenge(e.target.value)} placeholder="Challenge chosen" />
      <textarea className="w-full" rows={3} value={patch} onChange={(e) => setPatch(e.target.value)} placeholder="Patch plan..." />
      <button className="px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)]" onClick={async () => {
        await db.failureCycles.add({ id: crypto.randomUUID(), challenge, attemptDate: new Date(), attemptResult: 'failed', postMortem: '', patchPlan: patch, bounceBackHours: 24 });
        await onReward();
        setChallenge('');
        setPatch('');
      }}>Save Failure Cycle (+20 XP)</button>
    </motion.div>
  );
}

function JournalPanel({ onReward }: { onReward: () => Promise<void> }) {
  const [entry, setEntry] = useState('');
  return (
    <motion.div className="glass rounded-xl p-4 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <textarea className="w-full" rows={4} value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="What I did today / what changed / one improvement..." />
      <button className="px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)]" onClick={async () => {
        await db.journalEntries.add({ id: crypto.randomUUID(), date: new Date(), whatIDid: entry, whatChanged: '', oneImprovement: '', mood: 3, stress: 3, linkedTasks: [] });
        await onReward();
        setEntry('');
      }}>Save Journal (+10 XP)</button>
    </motion.div>
  );
}

function SettingsPanel(props: {
  currentTheme: 'cote' | 'solo-leveling' | 'hybrid';
  onTheme: (theme: 'cote' | 'solo-leveling' | 'hybrid') => Promise<void>;
  onExport: () => Promise<string>;
  onImport: (jsonData: string) => Promise<void>;
  onReset: () => Promise<void>;
}) {
  return (
    <motion.div className="glass rounded-xl p-4 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex gap-2">
        {(['cote', 'solo-leveling', 'hybrid'] as const).map((t) => (
          <button key={t} className={`px-3 py-2 rounded-lg ${props.currentTheme === t ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-black/20 text-[var(--text-muted)]'}`} onClick={() => void props.onTheme(t)}>{t}</button>
        ))}
      </div>
      <button className="px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)]" onClick={async () => {
        const json = await props.onExport();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'hybrid-system-backup.json';
        a.click();
        URL.revokeObjectURL(url);
      }}>Export Backup</button>
      <label className="px-4 py-2 rounded-lg bg-black/20 text-[var(--text)] inline-block cursor-pointer">
        Import Backup
        <input type="file" accept="application/json" className="hidden" onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          await props.onImport(text);
        }} />
      </label>
      <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400" onClick={() => void props.onReset()}>Reset Progress</button>
    </motion.div>
  );
}
