import { SettingsPanel } from '@/components/SettingsPanel';

export function SettingsPage() {
  return (
    <div className="min-h-screen p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
        <span className="text-[var(--primary)]">SYSTEM</span> <span className="text-[var(--text)]">SETTINGS</span>
      </h1>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Configure theme, notifications, profile behavior, backups, and character visuals.
      </p>
      <div className="glass rounded-xl p-4">
        <p className="text-sm text-[var(--text-muted)] mb-3">Open settings panel</p>
        <SettingsPanel floating={false} />
      </div>
    </div>
  );
}
