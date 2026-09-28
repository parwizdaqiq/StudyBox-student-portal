import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { API_BASE_URL } from './api-config';
import { StudentAuthService } from './student-auth.service';
import {
  Announcement,
  Assignment,
  CalendarEvent,
  CatalogCourse,
  Classmate,
  CourseDetail,
  CourseSummary,
  Dashboard,
  DiscussionDetail,
  DiscussionSummary,
  EnrollmentRequest,
  FinancialSummary,
  GradeCourse,
  Instructor,
  Invoice,
  SessionRecord,
  StudentProfile,
  TimetableEntry,
} from './student-api.models';

/**
 * The signed-in student's view of the backend (`/api/**`). Everything the student portal
 * shows comes through here — there is no sample/mock data any more; what an Admin
 * creates is what the student sees.
 */
@Injectable({ providedIn: 'root' })
export class StudentApiService {
  private http = inject(HttpClient);
  private auth = inject(StudentAuthService);
  private base = `${API_BASE_URL}/api`;

  private get opts() {
    return { headers: new HttpHeaders(this.auth.authHeaders) };
  }

  /** GET with the student token; a 401/403 (expired or deleted account) signs them out. */
  private get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.base}${path}`, this.opts).pipe(catchError((e) => this.handle(e)));
  }

  private post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}${path}`, body, this.opts).pipe(catchError((e) => this.handle(e)));
  }

  private handle(err: HttpErrorResponse): Observable<never> {
    if (err.status === 401 || err.status === 403) {
      this.auth.logout();
    }
    return throwError(() => err);
  }

  profile(): Observable<StudentProfile> {
    return this.get<StudentProfile>('/profile').pipe(tap((p) => this.auth.setProfile(p)));
  }

  dashboard(): Observable<Dashboard> {
    return this.get<Dashboard>('/dashboard').pipe(tap((d) => this.auth.setProfile(d.student)));
  }

  courses(): Observable<CourseSummary[]> {
    return this.get<CourseSummary[]>('/courses');
  }

  course(id: number): Observable<CourseDetail> {
    return this.get<CourseDetail>(`/courses/${id}`);
  }

  assignments(): Observable<Assignment[]> {
    return this.get<Assignment[]>('/assignments');
  }

  grades(): Observable<GradeCourse[]> {
    return this.get<GradeCourse[]>('/grades');
  }

  timetable(): Observable<TimetableEntry[]> {
    return this.get<TimetableEntry[]>('/timetable');
  }

  sessions(courseId?: number | null): Observable<SessionRecord[]> {
    return this.get<SessionRecord[]>(courseId ? `/sessions?courseId=${courseId}` : '/sessions');
  }

  calendar(daysAhead = 60): Observable<CalendarEvent[]> {
    return this.get<CalendarEvent[]>(`/calendar?daysAhead=${daysAhead}`);
  }

  announcements(): Observable<Announcement[]> {
    return this.get<Announcement[]>('/announcements');
  }

  classmates(courseId?: number | null): Observable<Classmate[]> {
    return this.get<Classmate[]>(courseId ? `/classmates?courseId=${courseId}` : '/classmates');
  }

  educators(): Observable<Instructor[]> {
    return this.get<Instructor[]>('/educators');
  }

  financialSummary(): Observable<FinancialSummary> {
    return this.get<FinancialSummary>('/financial/summary');
  }

  invoices(): Observable<Invoice[]> {
    return this.get<Invoice[]>('/financial/invoices');
  }

  catalog(): Observable<CatalogCourse[]> {
    return this.get<CatalogCourse[]>('/registration/catalog');
  }

  myRequests(): Observable<EnrollmentRequest[]> {
    return this.get<EnrollmentRequest[]>('/registration/requests');
  }

  requestEnrollment(catalogCourseId: number): Observable<EnrollmentRequest> {
    return this.post<EnrollmentRequest>('/registration/requests', { catalogCourseId });
  }

  discussions(courseId?: number | null): Observable<DiscussionSummary[]> {
    return this.get<DiscussionSummary[]>(courseId ? `/discussions?courseId=${courseId}` : '/discussions');
  }

  discussion(id: number): Observable<DiscussionDetail> {
    return this.get<DiscussionDetail>(`/discussions/${id}`);
  }

  startDiscussion(courseId: number, title: string, body: string): Observable<DiscussionDetail> {
    return this.post<DiscussionDetail>('/discussions', { courseId, title, body });
  }

  reply(threadId: number, body: string): Observable<DiscussionDetail> {
    return this.post<DiscussionDetail>(`/discussions/${threadId}/posts`, { body });
  }

  /** The unofficial transcript PDF, as a Blob the page can open or save. */
  transcript(): Observable<Blob> {
    return this.http
      .get(`${this.base}/reports/transcript`, { ...this.opts, responseType: 'blob' })
      .pipe(catchError((e) => this.handle(e)));
  }
}

/** Human-readable message for a failed student API call. */
export function studentApiError(err: unknown, fallback: string): string {
  const e = err as { status?: number; error?: { message?: string } };
  if (e?.status === 0) {
    return `Could not reach the StudyBox backend at ${API_BASE_URL}. Is it running?`;
  }
  return e?.error?.message ?? fallback;
}
