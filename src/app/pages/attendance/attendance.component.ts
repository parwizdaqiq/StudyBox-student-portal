import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { Attendance, CourseSummary, SessionRecord } from '../../core/student-api.models';

interface CourseAttendance {
  course: CourseSummary;
  attendance: Attendance;
  rate: number | null;
}

const LABELS: Record<SessionRecord['status'], string> = {
  PRESENT: 'Present',
  LATE: 'Late',
  AUTHORIZED_ABSENCE: 'Authorised absence',
  UNAUTHORIZED_ABSENCE: 'Unauthorised absence',
};

/** Attendance per course plus the full session-by-session log. */
@Component({
  selector: 'sb-attendance',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-header">
      <h1>Attendance</h1>
    </div>

    @if (error) {
      <div class="card sa-card text-secondary">{{ error }}</div>
    } @else if (rows === null) {
      <div class="card sa-card text-muted">Loading…</div>
    } @else {
      <div class="tiles">
        @for (r of rows; track r.course.id) {
          <div class="card tile">
            <div class="tile-head">
              <span class="sa-dot" [style.background]="r.course.colorHex"></span>
              <span class="tile-code">{{ r.course.code }}</span>
            </div>
            <div class="tile-rate">{{ r.rate !== null ? r.rate + '%' : '—' }}</div>
            <div class="tile-bar"><span [style.width.%]="r.rate ?? 0" [style.background]="r.course.colorHex"></span></div>
            <div class="tile-meta">
              {{ r.attendance.presences }} present · {{ r.attendance.lates }} late ·
              {{ r.attendance.authorizedAbsences + r.attendance.unauthorizedAbsences }} absent
            </div>
          </div>
        } @empty {
          <div class="card sa-card text-muted">No courses yet.</div>
        }
      </div>

      <div class="card sa-card">
        <div class="card-head"><span class="card-title">Session log</span></div>
        @if (sessions.length === 0) {
          <p class="text-muted">No attendance has been recorded yet.</p>
        } @else {
          <table>
            <thead><tr><th>Date</th><th>Course</th><th>Session</th><th>Status</th></tr></thead>
            <tbody>
              @for (s of sessions; track s.id) {
                <tr>
                  <td>{{ s.sessionDate | date: 'EEE MMM d, y' }}</td>
                  <td><span class="sa-dot" [style.background]="s.colorHex"></span>{{ s.courseCode }}</td>
                  <td class="text-muted">{{ s.sessionLabel }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="s.status === 'PRESENT'" [class.badge-warning]="s.status === 'LATE' || s.status === 'AUTHORIZED_ABSENCE'" [class.badge-danger]="s.status === 'UNAUTHORIZED_ABSENCE'">{{ labels[s.status] }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    }
  `,
  styles: [
    `
      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }
      .tile {
        padding: 16px 18px;
      }
      .tile-head {
        display: flex;
        align-items: center;
        font-size: 12.5px;
        font-weight: 600;
      }
      .tile-rate {
        font-size: 26px;
        font-weight: 500;
        margin: 8px 0;
      }
      .tile-bar {
        height: 7px;
        border-radius: 7px;
        background: var(--surface-sunken);
        overflow: hidden;
      }
      .tile-bar span {
        display: block;
        height: 100%;
      }
      .tile-meta {
        margin-top: 8px;
        font-size: 12px;
        color: var(--text-muted);
      }
    `,
  ],
})
export class AttendanceComponent implements OnInit {
  private api = inject(StudentApiService);

  labels = LABELS;
  rows: CourseAttendance[] | null = null;
  sessions: SessionRecord[] = [];
  error: string | null = null;

  ngOnInit(): void {
    this.api.courses().subscribe({
      next: (courses) => {
        if (courses.length === 0) {
          this.rows = [];
          return;
        }
        forkJoin(courses.map((c) => this.api.course(c.id))).subscribe({
          next: (details) =>
            (this.rows = details.map((d) => {
              const a = d.attendance;
              const total = a.presences + a.lates + a.authorizedAbsences + a.unauthorizedAbsences;
              return {
                course: d.course,
                attendance: a,
                rate: total ? Math.round(((a.presences + a.lates) / total) * 100) : null,
              };
            })),
          error: (err) => (this.error = studentApiError(err, 'Could not load attendance.')),
        });
      },
      error: (err) => (this.error = studentApiError(err, 'Could not load attendance.')),
    });
    this.api.sessions().subscribe({ next: (s) => (this.sessions = s) });
  }
}
