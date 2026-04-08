import { useState } from 'react';
import { useAppStore } from '@/store';
import type { ThemeType } from '@/types';
import { setCharacterAsset } from '@/lib/characterAssets';
import { sendSystemNotification } from '@/utils/notifications';

export function SettingsPage() {
  const [message, setMessage] = useState('');
  const {
    profile,
    updateProfileSettings,
    setTheme,
    exportData,
    importData,
    resetProgress,
  } = useAppStore();

  if (!profile) {
    return (
      <div className="min-h-screen p-4 pb-24">
        <p className="text-sm text-[var(--text-muted)]">Settings unavailable before onboarding.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
        <span className="text-[var(--primary)]">SYSTEM</span> <span className="text-[var(--text)]">SETTINGS</span>
      </h1>

      {message && (
        <div className="glass rounded-lg p-3 mb-3 text-xs text-[var(--primary)]">{message}</div>
      )}

      <div className="glass rounded-xl p-4 space-y-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-2">Hunter Name</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={profile.username}
              onChange={(e) => void updateProfileSettings({ username: e.target.value.trimStart() })}
              placeholder="Hunter name"
              className="flex-1"
            />
          </div>
          <p className="text-[10px] text-[var(--text-muted)] mt-1">
            Used across dashboard greetings, reports, and system messages.
          </p>
        </div>

        <div>
          <p className="text-xs text-[var(--text-muted)] mb-2">Theme</p>
          <div className="flex gap-2">
            {(['cote', 'solo-leveling', 'hybrid'] as ThemeType[]).map((theme) => (
              <button
                key={theme}
                onClick={async () => {
                  await setTheme(theme);
                  setMessage(`Theme changed to ${theme}`);
                }}
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

        <div>
          <p className="text-xs text-[var(--text-muted)] mb-2">Current Stage</p>
          <p className="text-sm text-[var(--primary)]">Stage {profile.currentStage}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Toggle
            label="Notifications"
            checked={profile.notificationsEnabled}
            onChange={async (value) => {
              await updateProfileSettings({ notificationsEnabled: value });
              setMessage(`Notifications ${value ? 'enabled' : 'disabled'}`);
            }}
          />
          <Toggle
            label="Sound"
            checked={profile.soundEnabled}
            onChange={async (value) => {
              await updateProfileSettings({ soundEnabled: value });
              setMessage(`Sound ${value ? 'enabled' : 'disabled'}`);
            }}
          />
          <Toggle
            label="Vibration"
            checked={profile.vibrationEnabled}
            onChange={async (value) => {
              await updateProfileSettings({ vibrationEnabled: value });
              setMessage(`Vibration ${value ? 'enabled' : 'disabled'}`);
            }}
          />
          <Toggle
            label="Hardcore"
            checked={profile.hardcoreMode}
            onChange={async (value) => {
              await updateProfileSettings({ hardcoreMode: value });
              setMessage(`Hardcore ${value ? 'enabled' : 'disabled'}`);
            }}
          />
        </div>

        <button
          className="px-3 py-2 rounded-lg bg-[var(--secondary)]/20 text-[var(--secondary)] text-xs"
          onClick={async () => {
            const result = await sendSystemNotification(
              'Hybrid System',
              'Notifications are active.'
            );
            if (result.ok) {
              setMessage('Notification sent successfully.');
              return;
            }
            if (result.reason === 'unsupported') {
              setMessage('This browser does not support notifications.');
              return;
            }
            if (result.reason === 'denied') {
              setMessage('Notifications are blocked. Enable them in browser site settings.');
              return;
            }
            if (result.reason === 'blocked') {
              setMessage('Notification permission was not granted.');
              return;
            }
            setMessage('Could not send notification in this context.');
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
                setCharacterAsset('ayanokoji', await fileToDataUrl(file));
                setMessage('Ayanokoji photo updated');
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
                setCharacterAsset('jinwoo', await fileToDataUrl(file));
                setMessage('Jinwoo photo updated');
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
                await importData(await file.text());
                setMessage('Backup imported');
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
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void | Promise<void>;
}) {
  return (
    <button
      onClick={() => void onChange(!checked)}
      className={`rounded-lg p-2 text-left ${checked ? 'bg-[var(--primary)]/15 border border-[var(--primary)]/40' : 'bg-black/20 border border-transparent'}`}
    >
      <p className="text-xs text-[var(--text)]">{label}</p>
      <p className="text-[10px] text-[var(--text-muted)]">{checked ? 'Enabled' : 'Disabled'}</p>
    </button>
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
