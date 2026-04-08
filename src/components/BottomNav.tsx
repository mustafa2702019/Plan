// Bottom Navigation Component
import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart2, 
  Layers, 
  Music,
  Settings
} from 'lucide-react';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'stats', label: 'Stats', icon: BarChart2 },
  { id: 'missions', label: 'Modules', icon: Layers },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const { currentTab, setCurrentTab } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Glass Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          borderTop: '1px solid var(--border)'
        }}
      />
      
      {/* Nav Items */}
      <div className="relative flex justify-around items-center py-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'text-[var(--primary)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--primary) 35%, transparent)'
                  }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              
              {/* Icon */}
              <div className="relative z-10">
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]' : ''}
                />
              </div>
              
              {/* Label */}
              <span className={`relative z-10 text-[10px] font-medium ${
                isActive ? 'font-semibold' : ''
              }`}>
                {tab.label}
              </span>
              
              {/* Glow Effect */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    boxShadow: '0 0 20px color-mix(in srgb, var(--primary) 45%, transparent)'
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* Safe Area Padding for Mobile */}
      <div className="h-safe-area-inset-bottom bg-transparent" />
    </nav>
  );
}
