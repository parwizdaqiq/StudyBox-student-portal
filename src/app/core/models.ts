/** View-model shapes consumed by the shared chart / calendar / timetable components. */

export interface PerformancePoint {
  label: string;
  averageGrade: number;
  classAverage: number;
}

export interface AdminCalendarEvent {
  date: string;
  time: string;
  title: string;
  category: 'Assignment' | 'Class' | 'Meeting' | 'Academic';
  courseTitle: string | null;
  colorHex: string;
}

export interface TimetableSession {
  id: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  colorHex: string;
  /** 1 = Monday … 7 = Sunday */
  dayOfWeek: number;
  startTime: string; // "18:00"
  endTime: string; // "19:30"
  kind: 'Live Session' | 'Lab' | 'Office Hours' | 'Workshop' | 'Q&A';
  instructor: string;
}
