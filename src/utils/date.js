import { DAYS } from '../constants';

export function toISODate(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function getDayName(dateValue) {
  const date = new Date(`${dateValue}T12:00:00`);
  return DAYS[(date.getDay() + 1) % 7];
}

export function formatHour(hour) {
  const numeric = Number(hour);
  const suffix = numeric >= 12 ? 'PM' : 'AM';
  const display = numeric % 12 || 12;
  return `${display}:00 ${suffix}`;
}

export function formatReadableDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export function monthBounds(monthValue) {
  const [year, month] = monthValue.split('-').map(Number);
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const last = new Date(year, month, 0).getDate();
  const to = `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
  return { from, to };
}

export function currentMonthValue() {
  return toISODate().slice(0, 7);
}
