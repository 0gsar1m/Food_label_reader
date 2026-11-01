import { z } from 'zod';

/** Human-readable local time avoids exposing an ISO protocol value in the diary form. */
export function formatMealTime(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
/** Rejects normalized invalid dates and nonexistent local clock times rather than silently shifting them. */
export function parseMealTime(value: string): string {
  const text = z
    .string()
    .regex(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/)
    .parse(value.trim());
  const [day, month, year, hour, minute] = text.split(/[. :]/).map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  if (year < 2000 || year > 2100 || formatMealTime(date.toISOString()) !== text)
    throw new Error('Invalid meal time.');
  return date.toISOString();
}
