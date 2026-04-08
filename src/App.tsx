// Hybrid System: Ayanokoji × Jinwoo - Main App
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';
import { db, initializeDatabase } from '@/db';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/pages/Dashboard';
import { DailyTasks } from '@/pages/DailyTasks';
import { Stats } from '@/pages/Stats';
import { MusicPlayer } from '@/pages/MusicPlayer';
import { Modules } from '@/pages/Modules';
import { SettingsPage } from '@/pages/Settings';
import { Onboarding } from '@/pages/Onboarding';
import { LevelUpOverlay } from '@/components/LevelUpOverlay';
import { StageUnlockOverlay } from '@/components/StageUnlockOverlay';
import { AchievementPopup } from '@/components/AchievementPopup';
import { SystemNotification } from '@/components/SystemNotification';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SettingsPanel } from '@/components/SettingsPanel';
import { THEMES, generateThemeCSS } from '@/themes';
import { sendSystemNotification } from '@/utils/notifications';

function App() {
  const { 
    initialize, 
    profile, 
    isLoading, 
    currentTab,
    showLevelUp, 
    showStageUnlock, 
    showAchievement,
    levelUpData,
    newStageData,
    dismissLevelUp,
    dismissStageUnlock
  } = useAppStore();

  const [notification, setNotification] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const reminderTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const init = async () => {
      await initializeDatabase();
      await initialize();
      
      // Check if user has profile
      const profiles = await db.profile.toArray();
      if (profiles.length === 0) {
        setShowOnboarding(true);
      }
    };
    
    init();
  }, []);

  // Apply theme CSS
  useEffect(() => {
    if (profile?.theme) {
      const theme = THEMES[profile.theme];
      const styleEl = document.getElementById('theme-style') || document.createElement('style');
      styleEl.id = 'theme-style';
      styleEl.textContent = generateThemeCSS(theme);
      document.head.appendChild(styleEl);
      document.body.setAttribute('data-theme', profile.theme);
    }
  }, [profile?.theme]);

  // Show welcome notification on first load
  useEffect(() => {
    if (profile && !isLoading) {
      setNotification(`SYSTEM INITIALIZED. Welcome back, ${profile.username}.`);
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [profile, isLoading]);

  // Daily notification scheduler (works while app is installed/open)
  useEffect(() => {
    reminderTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
    reminderTimeoutsRef.current = [];

    const scheduleNotifications = async () => {
      if (!profile?.notificationsEnabled || showOnboarding) return;
      if (!('Notification' in window)) return;

      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch {
          return;
        }
      }
      if (Notification.permission !== 'granted') return;

      const reminderRows = await db.notifications.toArray();
      const enabled = reminderRows.filter((r) => r.enabled);
      const titleMap: Record<string, string> = {
        wake: 'Wake Protocol',
        training: 'Training Window',
        observation: 'Observation Drill',
        journaling: 'System Log',
        weekly: 'Weekly Deep Drill',
        mission: 'Mission Checkpoint'
      };

      enabled.forEach((item) => {
        const [h, m] = item.time.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(h || 0, m || 0, 0, 0);
        if (target <= now) {
          target.setDate(target.getDate() + 1);
        }
        const ms = target.getTime() - now.getTime();

        const timeoutId = window.setTimeout(() => {
          const dayKey = new Date().toISOString().slice(0, 10);
          const dedupeKey = `hybrid-notified-${item.type}-${dayKey}`;
          if (localStorage.getItem(dedupeKey)) return;
          localStorage.setItem(dedupeKey, '1');
          void sendSystemNotification(
            `Hybrid System - ${titleMap[item.type] || 'Reminder'}`,
            `Time for your ${item.type} routine.`
          );
        }, ms);

        reminderTimeoutsRef.current.push(timeoutId);
      });
    };

    void scheduleNotifications();

    return () => {
      reminderTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
      reminderTimeoutsRef.current = [];
    };
  }, [profile?.notificationsEnabled, showOnboarding]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <DailyTasks />;
      case 'stats':
        return <Stats />;
      case 'missions':
        return <Modules />;
      case 'music':
        return <MusicPlayer />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text)] pb-20">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div 
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-20"
          style={{ 
            background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div 
          className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-15"
          style={{ 
            background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 217, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 217, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentTab()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
      {currentTab !== 'settings' && <SettingsPanel />}

      {/* Overlays */}
      <AnimatePresence>
        {showLevelUp && levelUpData && (
          <LevelUpOverlay 
            oldLevel={levelUpData.oldLevel}
            newLevel={levelUpData.newLevel}
            onClose={dismissLevelUp}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStageUnlock && newStageData && (
          <StageUnlockOverlay
            fromStage={newStageData.from}
            toStage={newStageData.to}
            onClose={dismissStageUnlock}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAchievement && (
          <AchievementPopup achievementId={showAchievement} />
        )}
      </AnimatePresence>

      {/* System Notification */}
      <AnimatePresence>
        {notification && (
          <SystemNotification 
            message={notification}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
