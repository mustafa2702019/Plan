export type NotificationTestResult =
  | { ok: true; mode: 'native' }
  | { ok: false; reason: 'unsupported' | 'denied' | 'blocked' | 'error' };

export async function sendSystemNotification(
  title: string,
  body: string
): Promise<NotificationTestResult> {
  if (!('Notification' in window)) {
    return { ok: false, reason: 'unsupported' };
  }

  try {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return { ok: false, reason: permission === 'denied' ? 'denied' : 'blocked' };
      }
    }

    if (Notification.permission !== 'granted') {
      return { ok: false, reason: 'denied' };
    }

    new Notification(title, { body });
    return { ok: true, mode: 'native' };
  } catch {
    return { ok: false, reason: 'error' };
  }
}
