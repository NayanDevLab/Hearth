// Shared date/time formatting utilities used across Task detail, form pickers, etc.

/** "Mar 5, 2026" */
export function formatFullDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

/** "Mar 5" */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** "8:00 PM" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** "Mar 5, by 8:00 PM" — used in task due labels */
export function formatDateWithTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${formatShortDate(iso)}, ${formatTime(iso)}`;
}

/** "Mar 5 · 8:00 PM" — used in date picker display */
export function formatPickerLabel(date: Date): string {
  const iso = date.toISOString();
  return `${formatShortDate(iso)} · ${formatTime(iso)}`;
}
