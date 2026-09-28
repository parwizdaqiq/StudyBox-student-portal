import { AdminCalendarEvent, TimetableSession } from './models';
import { CalendarEvent, TimetableEntry } from './student-api.models';

const DAY_INDEX: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

/** Backend timetable rows → the shape the shared `sb-timetable` grid draws. */
export function toTimetableSessions(entries: TimetableEntry[]): TimetableSession[] {
  return entries.map((e) => ({
    id: e.id,
    courseId: e.courseId,
    courseCode: e.courseCode,
    courseTitle: e.courseTitle,
    colorHex: e.colorHex || '#5b6cf9',
    dayOfWeek: DAY_INDEX[e.dayOfWeek] ?? 1,
    startTime: e.startTime.slice(0, 5),
    endTime: e.endTime.slice(0, 5),
    kind: (e.sessionLabel || 'Live Session') as TimetableSession['kind'],
    instructor: e.room || '',
  }));
}

/** Backend calendar events → the shape `sb-timetable` / `sb-mini-calendar` expect. */
export function toCalendarEvents(events: CalendarEvent[]): AdminCalendarEvent[] {
  return events.map((e) => ({
    date: e.date,
    time: e.time,
    title: e.title,
    category: (['Assignment', 'Class', 'Meeting', 'Academic'].includes(e.category) ? e.category : 'Academic') as AdminCalendarEvent['category'],
    courseTitle: e.courseTitle,
    colorHex: e.colorHex || '#5b6cf9',
  }));
}

export function dayLabel(day: string): string {
  return day ? day.charAt(0) + day.slice(1).toLowerCase() : '';
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
