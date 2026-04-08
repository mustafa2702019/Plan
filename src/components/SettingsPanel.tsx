import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Settings, X } from 'lucide-react';
import { useAppStore } from '@/store';
import type { ThemeType } from '@/types';
import { setCharacterAsset } from '@/lib/characterAssets';
import { sendSystemNotification } from '@/utils/notifications';

export function SettingsPanel({ floating = true }: { floating?: boolean }) {
  const [open, setOpen] = useState(false);
  const {
    profile,
    updateProfileSettings,
    setTheme,
    exportData,
    importData,
    resetProgress,
  } = useAppStore();

  if (!profile) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          floating
            ? 'fixed top-4 right-4 z-[60] p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text)]'
            : 'p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text)]'
        }
      >
        <Settings className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="glass rounded-2xl p-4 max-w-md mx-auto mt-12 space-y-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--text)]">Settings Panel</h2>
                <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10">
                  <X className="w-5 h-5 text-[var(--text-muted)]" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)]">Hunter Name</p>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) => void updateProfileSettings({ username: e.target.value.trimStart() })}
                  placeholder="Hunter name"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)]">Theme</p>
                <div className="flex gap-2">
                  {(['cote', 'solo-leveling', 'hybrid'] as ThemeType[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => void setTheme(theme)}
                      className={`px-3 py-2 rounded-lg text-xs ${
                        profile.theme === theme
                          ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                          : 'bg-black/20 text-[var(--text-muted)]'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-[var(--text-muted)]">Current Stage</p>
                <p className="text-sm text-[var(--primary)]">Stage {profile.currentStage}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Toggle
                  label="Notifications"
                  checked={profile.notificationsEnabled}
                  onChange={(value) => void updateProfileSettings({ notificationsEnabled: value })}
                />
                <Toggle
                  label="Sound"
                  checked={profile.soundEnabled}
                  onChange={(value) => void updateProfileSettings({ soundEnabled: value })}
                />
                <Toggle
                  label="Vibration"
                  checked={profile.vibrationEnabled}
                  onChange={(value) => void updateProfileSettings({ vibrationEnabled: value })}
                />
                <Toggle
                  label="Hardcore"
                  checked={profile.hardcoreMode}
                  onChange={(value) => void updateProfileSettings({ hardcoreMode: value })}
                />
              </div>
              <button
                className="px-3 py-2 rounded-lg bg-[var(--secondary)]/20 text-[var(--secondary)] text-xs"
                onClick={async () => {
                  await sendSystemNotification('Hybrid System', 'Notifications are active.');
                }}
              >
                Test Notification
              </button>

              <div className="flex flex-wrap gap-2">
                <label className="px-3 py-2 rounded-lg bg-black/20 text-[var(--text)] text-xs cursor-pointer">
                  Upload Ayanokoji Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await fileToDataUrl(file);
                      setCharacterAsset('ayanokoji', dataUrl);
                    }}
                  />
                </label>
                <label className="px-3 py-2 rounded-lg bg-black/20 text-[var(--text)] text-xs cursor-pointer">
                  Upload Jinwoo Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await fileToDataUrl(file);
                      setCharacterAsset('jinwoo', dataUrl);
                    }}
                  />
                </label>
                <button
                  className="px-3 py-2 rounded-lg bg-[var(--primary)]/20 text-[var(--primary)] text-xs"
                  onClick={async () => {
                    const json = await exportData();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'hybrid-system-backup.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export Backup
                </button>
                <label className="px-3 py-2 rounded-lg bg-black/20 text-[var(--text)] text-xs cursor-pointer">
                  Import Backup
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      await importData(text);
                    }}
                  />
                </label>
                <button
                  className="px-3 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs"
                  onClick={() => void resetProgress()}
                >
                  Reset Progress
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`rounded-lg p-2 text-left ${checked ? 'bg-[var(--primary)]/15 border border-[var(--primary)]/40' : 'bg-black/20 border border-transparent'}`}
    >
      <p className="text-xs text-[var(--text)]">{label}</p>
      <p className="text-[10px] text-[var(--text-muted)]">{checked ? 'Enabled' : 'Disabled'}</p>
    </button>
  );
}
