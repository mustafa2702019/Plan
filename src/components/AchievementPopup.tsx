// Achievement Popup Component
import { motion } from 'framer-motion';
import { Trophy, Star, Award } from 'lucide-react';
import { ACHIEVEMENTS } from '@/constants';

interface AchievementPopupProps {
  achievementId: string;
}

export function AchievementPopup({ achievementId }: AchievementPopupProps) {
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  
  if (!achievement) return null;

  const getIcon = () => {
    switch (achievement.icon) {
      case 'trophy':
        return <Trophy className="w-8 h-8 text-[var(--warning)]" />;
      case 'star':
        return <Star className="w-8 h-8 text-[var(--warning)]" />;
      case 'crown':
        return <Award className="w-8 h-8 text-[var(--warning)]" />;
      default:
        return <Trophy className="w-8 h-8 text-[var(--warning)]" />;
    }
  };

  return (
    <motion.div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[900]"
      initial={{ y: -100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -100, opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div 
        className="glass rounded-xl px-6 py-4 flex items-center gap-4"
        style={{
          borderLeft: '4px solid var(--warning)',
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.3)'
        }}
      >
        <motion.div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--warning)] to-orange-600 flex items-center justify-center"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.5 }}
        >
          {getIcon()}
        </motion.div>
        
        <div>
          <p className="text-xs text-[var(--warning)] font-medium uppercase tracking-wider">
            Achievement Unlocked
          </p>
          <h3 className="text-lg font-bold text-[var(--text)]">
            {achievement.name}
          </h3>
          <p className="text-sm text-[var(--text-muted)]">
            {achievement.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
