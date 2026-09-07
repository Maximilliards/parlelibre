import { DAY_NAMES, DAY_NAMES_SHORT, formatTime, type Slot } from '@/lib/types';

export function getNextDatesForDayOfWeek(dayOfWeek: number, count: number = 4): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);
  // Find the next matching weekday (including today if it matches)
  while (dates.length < count) {
    if (cursor.getDay() === dayOfWeek) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
    // Safety: don't look more than 60 days ahead
    if (cursor.getTime() - today.getTime() > 60 * 24 * 60 * 60 * 1000) break;
  }
  return dates.slice(0, count);
}

export function generateSessionSlots(
  slot: Slot,
  durationMinutes: number = 45
): { start: string; end: string }[] {
  const [sh, sm] = slot.start_time.split(':').map(Number);
  const [eh, em] = slot.end_time.split(':').map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const sessions: { start: string; end: string }[] = [];
  for (let t = startMinutes; t + durationMinutes <= endMinutes; t += durationMinutes) {
    const sH = Math.floor(t / 60);
    const sM = t % 60;
    const eH = Math.floor((t + durationMinutes) / 60);
    const eM = (t + durationMinutes) % 60;
    sessions.push({
      start: `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`,
      end: `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`,
    });
  }
  return sessions;
}

export function formatDateLong(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export { DAY_NAMES, DAY_NAMES_SHORT, formatTime };
