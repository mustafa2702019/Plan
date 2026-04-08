// Level Up Overlay Component
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

interface LevelUpOverlayProps {
  oldLevel: number;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpOverlay({ oldLevel, newLevel, onClose }: LevelUpOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      style={{
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Particle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? 'var(--primary)' : 'var(--accent)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 0.5,
              repeat: Infinity
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative text-center px-6"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Level Up Badge */}
        <motion.div
          className="mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg">LEVEL UP!</span>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </motion.div>

        {/* Level Display */}
        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Old Level */}
          <motion.div
            className="text-center"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-5xl font-bold text-[var(--text-muted)]" style={{ fontFamily: 'var(--font-heading)' }}>
              {oldLevel}
            </div>
            <div className="text-sm text-[var(--text-muted)] mt-1">Previous</div>
          </motion.div>

          {/* Arrow */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
          >
            <TrendingUp className="w-10 h-10 text-[var(--success)]" />
          </motion.div>

          {/* New Level */}
          <motion.div
            className="text-center"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="text-7xl font-bold text-gradient"
              style={{ 
                fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
              animate={{
                textShadow: [
                  '0 0 20px rgba(0, 217, 255, 0.5)',
                  '0 0 40px rgba(0, 217, 255, 0.8)',
                  '0 0 20px rgba(0, 217, 255, 0.5)'
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {newLevel}
            </motion.div>
            <div className="text-sm text-[var(--primary)] mt-1 font-medium">New Level</div>
          </motion.div>
        </div>

        {/* Stats Increase */}
        <motion.div
          className="glass rounded-xl p-6 max-w-sm mx-auto mb-8"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[var(--warning)]" />
            <span className="text-[var(--text)] font-medium">Attributes Enhanced</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Strength</span>
              <span className="text-[var(--success)]">+1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Perception</span>
              <span className="text-[var(--success)]">+1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Discipline</span>
              <span className="text-[var(--success)]">+2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">All Stats</span>
              <span className="text-[var(--success)]">+0.5</span>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          className="px-8 py-3 rounded-xl font-medium text-white"
          style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Continue
        </motion.button>

        {/* Tap to dismiss hint */}
        <motion.p
          className="mt-6 text-xs text-[var(--text-muted)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Tap anywhere to dismiss
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
