/** Formats a date as dd-mm-yyyy hh:mm (24-hour). */
export function formatDateTime(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const isWithinLastWeek = (value: Date | string): boolean => {
  const date = value instanceof Date ? value : new Date(value);
  return Date.now() - date.getTime() <= 7 * MS_PER_DAY;
};
