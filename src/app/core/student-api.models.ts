/** Mirrors the backend's student-facing DTOs (`com.studybox.backend.dto.*Response`). */

export interface StudentProfile {
  id: number;
  studentNumber: string;
  fullName: string;
  email: string;
  programme: string;
  photoUrl: string | null;
  firstLoginDate: string | null;
  lastLoginAt: string | null;
  totalLogins: number;
  loginFrequencyPercent: number;
}

export interface DashboardStats {
  activeCourses: number;
  pendingAssignments: number;
  attendanceRatePercent: number;
  averageGradePercent: number | null;
}

export interface TimetableEntry {
  id: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  colorHex: string;
  dayOfWeek: string; // MONDAY…SUNDAY
  startTime: string;
  endTime: string;
  room: string;
  weekType: string;
  sessionLabel: string;
}

export interface Assignment {
  id: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  colorHex: string;
  title: string;
  type: string;
  categoryLabel: string | null;
  availableFrom: string | null;
  dueAt: string | null;
  pointsPossible: number;
  scoreEarned: number | null;
  status: 'NOT_STARTED' | 'SUBMITTED' | 'GRADED' | 'MISSING';
}

export interface Announcement {
  id: number;
  courseTitle: string;
  title: string;
  body: string;
  postedAt: string;
  postedBy: string;
}

export interface Dashboard {
  student: StudentProfile;
  stats: DashboardStats;
  today: TimetableEntry[];
  upcomingAssignments: Assignment[];
  announcements: Announcement[];
}

export interface CourseSummary {
  id: number;
  code: string;
  title: string;
  credits: number;
  term: string;
  colorHex: string;
  icon: string;
  instructorNames: string[];
}

export interface Attendance {
  unauthorizedAbsences: number;
  authorizedAbsences: number;
  lates: number;
  presences: number;
}

export interface Instructor {
  id: number;
  fullName: string;
  title: string;
  email: string;
  avatarInitials: string;
  courses: string[];
}

export interface ModuleItem {
  id: number;
  type: string;
  title: string;
  dueAt: string | null;
  points: number | null;
}

export interface CourseModule {
  id: number;
  weekLabel: string;
  title: string;
  items: ModuleItem[];
}

export interface CourseDetail {
  course: CourseSummary;
  attendance: Attendance;
  instructors: Instructor[];
  modules: CourseModule[];
}

export interface GradeItem {
  id: number;
  name: string;
  maxScore: number;
  scoreEarned: number | null;
  posted: boolean;
  dueAt: string | null;
}

export interface GradeCategory {
  name: string;
  weightPercent: number;
  items: GradeItem[];
  categoryPercent: number | null;
}

export interface GradeCourse {
  courseId: number;
  courseCode: string;
  courseTitle: string;
  colorHex: string;
  categories: GradeCategory[];
  totalPercent: number | null;
}

export interface SessionRecord {
  id: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  colorHex: string;
  sessionDate: string;
  sessionLabel: string;
  status: 'PRESENT' | 'LATE' | 'AUTHORIZED_ABSENCE' | 'UNAUTHORIZED_ABSENCE';
  hasFiles: boolean;
}

export interface CalendarEvent {
  date: string;
  time: string;
  title: string;
  category: string;
  courseId: number | null;
  courseTitle: string | null;
  colorHex: string;
}

export interface Classmate {
  id: number;
  fullName: string;
  initials: string;
  programme: string;
  courseId: number;
  courseTitle: string;
}

export interface FinancialSummary {
  currency: string;
  agreedAmount: number;
  periodPayment: number;
  periodBalance: number;
  periodOutstanding: number;
  totalBalance: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  description: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'UNPAID' | 'PARTIAL';
}

export interface CatalogCourse {
  id: number;
  code: string;
  title: string;
  credits: number;
  term: string;
  category: string;
  description: string | null;
}

export interface EnrollmentRequest {
  id: number;
  catalogCourseId: number;
  courseCode: string;
  courseTitle: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DiscussionSummary {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  authorName: string;
  createdAt: string;
  closedForComments: boolean;
  replyCount: number;
}

export interface DiscussionPost {
  id: number;
  authorName: string;
  body: string;
  postedAt: string;
}

export interface DiscussionDetail {
  id: number;
  courseId: number;
  courseTitle: string;
  title: string;
  authorName: string;
  createdAt: string;
  closedForComments: boolean;
  posts: DiscussionPost[];
}
