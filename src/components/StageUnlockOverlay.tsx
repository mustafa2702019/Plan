// Stage Unlock Overlay Component
import { motion } from 'framer-motion';
import { Unlock, ChevronRight, Sparkles } from 'lucide-react';
import type { Stage } from '@/types';
import { STAGE_CONFIG } from '@/constants';

interface StageUnlockOverlayProps {
  fromStage: Stage;
  toStage: Stage;
  onClose: () => void;
}

export function StageUnlockOverlay({ fromStage, toStage, onClose }: StageUnlockOverlayProps) {
  const fromConfig = STAGE_CONFIG[fromStage];
  const toConfig = STAGE_CONFIG[toStage];

  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${toConfig.color}20 0%, transparent 60%)`
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Main Content */}
      <motion.div
        className="relative w-full max-w-md"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{
              background: `linear-gradient(135deg, ${toConfig.color}40, ${toConfig.color}20)`,
              border: `1px solid ${toConfig.color}60`
            }}
          >
            <Unlock className="w-4 h-4" style={{ color: toConfig.color }} />
            <span className="text-sm font-medium" style={{ color: toConfig.color }}>
              SYSTEM UPDATE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-heading)' }}>
            STAGE ADVANCEMENT
          </h2>
          <p className="text-[var(--text-muted)] mt-2">UNLOCKED</p>
        </motion.div>

        {/* Stage Transition */}
        <motion.div
          className="glass rounded-2xl p-6 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            {/* Previous Stage */}
            <div className="text-center flex-1">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{
                  background: `linear-gradient(135deg, ${fromConfig.color}30, ${fromConfig.color}10)`,
                  border: `1px solid ${fromConfig.color}40`
                }}
              >
                <span className="text-2xl font-bold" style={{ color: fromConfig.color }}>
                  {fromStage}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{fromConfig.name}</p>
            </div>

            {/* Arrow */}
            <div className="px-4">
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <ChevronRight className="w-8 h-8 text-[var(--primary)]" />
              </motion.div>
            </div>

            {/* New Stage */}
            <div className="text-center flex-1">
              <motion.div 
                className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{
                  background: `linear-gradient(135deg, ${toConfig.color}50, ${toConfig.color}20)`,
                  border: `2px solid ${toConfig.color}`,
                  boxShadow: `0 0 30px ${toConfig.color}40`
                }}
                animate={{
                  boxShadow: [
                    `0 0 20px ${toConfig.color}30`,
                    `0 0 40px ${toConfig.color}50`,
                    `0 0 20px ${toConfig.color}30`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-3xl font-bold" style={{ color: toConfig.color }}>
                  {toStage}
                </span>
              </motion.div>
              <p className="text-sm font-medium" style={{ color: toConfig.color }}>
                {toConfig.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* New Features */}
        <motion.div
          className="glass rounded-xl p-4 mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[var(--warning)]" />
            <span className="text-sm font-medium text-[var(--text)]">New Unlocks</span>
          </div>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            {toConfig.description}
          </p>
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Pass Threshold</span>
              <span className="text-[var(--success)] font-medium">{toConfig.passThreshold}%</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-[var(--text-muted)]">Duration</span>
              <span className="text-[var(--text)]">
                Weeks {toConfig.weeks.start}-{toConfig.weeks.end}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          className="w-full py-4 rounded-xl font-bold text-white text-lg"
          style={{
            background: `linear-gradient(135deg, ${toConfig.color}, ${toConfig.color}80)`
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          ENTER STAGE {toStage}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
