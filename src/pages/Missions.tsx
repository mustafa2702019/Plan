// Missions Page - RPG Quest System
import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { db } from '@/db';
import type { Mission, MissionRank } from '@/types';
import { MISSION_RANKS } from '@/constants';
import { 
  Sword, 
  Plus, 
  Calendar, 
  Target, 
  CheckCircle,
  Clock,
  Trophy,
  ChevronRight,
  X
} from 'lucide-react';

export function Missions() {
  const { addXP } = useAppStore();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [newMission, setNewMission] = useState({
    name: '',
    description: '',
    plannedDate: new Date().toISOString().split('T')[0]
  });
  const [scores, setScores] = useState({
    planning: 0,
    execution: 0,
    outcome: 0,
    debrief: 0
  });

  const loadMissions = useCallback(async () => {
    const allMissions = await db.missions.toArray();
    setMissions(allMissions.sort((a, b) => {
      // Sort by status and date
      if (a.status !== b.status) {
        return a.status === 'planned' ? -1 : 1;
      }
      return (b.plannedDate?.getTime() || 0) - (a.plannedDate?.getTime() || 0);
    }));
  }, []);

  useEffect(() => {
    void loadMissions();
  }, [loadMissions]);

  const createMission = async () => {
    if (!newMission.name) return;

    const mission: Mission = {
      id: crypto.randomUUID(),
      name: newMission.name,
      description: newMission.description,
      plannedDate: new Date(newMission.plannedDate),
      planningScore: 0,
      executionScore: 0,
      outcomeScore: 0,
      debriefScore: 0,
      totalScore: 0,
      rank: 'E',
      insights: '',
      status: 'planned'
    };

    await db.missions.add(mission);
    setShowCreateModal(false);
    setNewMission({ name: '', description: '', plannedDate: new Date().toISOString().split('T')[0] });
    void loadMissions();
  };

  const completeMission = async () => {
    if (!selectedMission) return;

    const totalScore = scores.planning + scores.execution + scores.outcome + scores.debrief;
    const rank = calculateRank(totalScore);

    await db.missions.update(selectedMission.id, {
      executedDate: new Date(),
      planningScore: scores.planning,
      executionScore: scores.execution,
      outcomeScore: scores.outcome,
      debriefScore: scores.debrief,
      totalScore,
      rank,
      status: 'completed'
    });

    // Award XP
    const xpReward = getXPReward(rank);
    await addXP(xpReward);

    setShowCompleteModal(false);
    setSelectedMission(null);
    setScores({ planning: 0, execution: 0, outcome: 0, debrief: 0 });
    void loadMissions();
  };

  const calculateRank = (score: number): MissionRank => {
    if (score >= 91) return 'S';
    if (score >= 81) return 'A';
    if (score >= 71) return 'B';
    if (score >= 56) return 'C';
    if (score >= 41) return 'D';
    return 'E';
  };

  const getXPReward = (rank: MissionRank): number => {
    const rewards: Record<MissionRank, number> = {
      'E': 50,
      'D': 75,
      'C': 100,
      'B': 150,
      'A': 200,
      'S': 300
    };
    return rewards[rank];
  };

  const getRankStyle = (rank: MissionRank) => {
    const config = MISSION_RANKS[rank];
    return {
      background: `linear-gradient(135deg, ${config.color}40, ${config.color}20)`,
      border: `2px solid ${config.color}`,
      color: config.color,
      boxShadow: `0 0 20px ${config.color}40`
    };
  };

  const plannedMissions = missions.filter(m => m.status === 'planned');
  const completedMissions = missions.filter(m => m.status === 'completed');

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <motion.header
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              <span className="text-[var(--primary)]">MISSIONS</span>
              <span className="text-[var(--text)]"> BOARD</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {plannedMissions.length} Active • {completedMissions.length} Completed
            </p>
          </div>
          
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </motion.header>

      {/* Active Missions */}
      {plannedMissions.length > 0 && (
        <motion.section
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
            Active Missions
          </h2>
          
          <div className="space-y-3">
            {plannedMissions.map((mission, index) => (
              <motion.div
                key={mission.id}
                className="glass rounded-xl p-4 cursor-pointer hover:border-[var(--primary)]/40 transition-all"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                onClick={() => {
                  setSelectedMission(mission);
                  setShowCompleteModal(true);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                    <Sword className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[var(--text)] truncate">
                      {mission.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
                      {mission.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {mission.plannedDate?.toLocaleDateString()}
                      </span>
                      <span className="text-xs text-[var(--warning)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Planned
                      </span>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Completed Missions */}
      {completedMissions.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wider">
            Mission History
          </h2>
          
          <div className="space-y-3">
            {completedMissions.slice(0, 5).map((mission, index) => (
              <motion.div
                key={mission.id}
                className="glass rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={getRankStyle(mission.rank)}
                  >
                    <span className="text-xl font-bold">{mission.rank}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[var(--text)] truncate">
                      {mission.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-[var(--text-muted)]">
                        Score: {mission.totalScore}/100
                      </span>
                      <span className="text-xs text-[var(--success)] flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        +{getXPReward(mission.rank)} XP
                      </span>
                    </div>
                  </div>
                  
                  <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Empty State */}
      {missions.length === 0 && (
        <motion.div
          className="glass rounded-xl p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Target className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-3" />
          <p className="text-[var(--text-muted)] mb-4">No missions yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium"
          >
            Create First Mission
          </button>
        </motion.div>
      )}

      {/* Create Mission Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[var(--text)]">New Mission</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-1 block">Mission Name</label>
                  <input
                    type="text"
                    value={newMission.name}
                    onChange={(e) => setNewMission({ ...newMission, name: e.target.value })}
                    placeholder="Enter mission name..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-1 block">Description</label>
                  <textarea
                    value={newMission.description}
                    onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                    placeholder="Describe the mission objective..."
                    rows={3}
                    className="w-full resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-[var(--text-muted)] mb-1 block">Planned Date</label>
                  <input
                    type="date"
                    value={newMission.plannedDate}
                    onChange={(e) => setNewMission({ ...newMission, plannedDate: e.target.value })}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={createMission}
                  disabled={!newMission.name}
                  className="w-full py-3 rounded-xl font-medium text-white disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
                  }}
                >
                  Create Mission
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Mission Modal */}
      <AnimatePresence>
        {showCompleteModal && selectedMission && (
          <motion.div
            className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompleteModal(false)}
          >
            <motion.div
              className="glass rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[var(--text)]">Complete Mission</h2>
                <button 
                  onClick={() => setShowCompleteModal(false)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              <p className="text-sm text-[var(--text-muted)] mb-4">
                {selectedMission.name}
              </p>

              <div className="space-y-4 mb-6">
                {[
                  { key: 'planning', label: 'Planning', max: 20 },
                  { key: 'execution', label: 'Execution', max: 30 },
                  { key: 'outcome', label: 'Outcome', max: 30 },
                  { key: 'debrief', label: 'Debrief Insights', max: 20 }
                ].map((item) => (
                  <div key={item.key}>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm text-[var(--text)]">{item.label}</label>
                      <span className="text-sm text-[var(--primary)] font-mono">
                        {scores[item.key as keyof typeof scores]}/{item.max}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={item.max}
                      value={scores[item.key as keyof typeof scores]}
                      onChange={(e) => setScores({ 
                        ...scores, 
                        [item.key]: parseInt(e.target.value) 
                      })}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="glass rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--text-muted)]">Total Score</span>
                  <span className="text-2xl font-bold text-[var(--primary)] font-mono">
                    {scores.planning + scores.execution + scores.outcome + scores.debrief}
                  </span>
                </div>
              </div>

              <button
                onClick={completeMission}
                className="w-full py-3 rounded-xl font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--success), #059669)'
                }}
              >
                Complete Mission
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
