import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { TimetableEntry } from '../../core/student-api.models';
import { AdminCalendarEvent, TimetableSession } from '../../core/models';
import { dayLabel, toCalendarEvents, toTimetableSessions } from '../../core/student-mappers';
import { TimetableComponent } from '../../shared/timetable.component';

/** Weekly class schedule for the student's enrolled courses. */
@Component({
  selector: 'sb-timetable-page',
  standalone: true,
  imports: [TimetableComponent],
  template: `
    <div class="page-header">
      <h1>Timetable</h1>
    </div>

    @if (error) {
      <div class="card sa-card text-secondary">{{ error }}</div>
    } @else {
      <div class="card sa-card">
        <sb-timetable [sessions]="sessions" [events]="events" [date]="date" (dateChange)="date = $event"></sb-timetable>
      </div>

      <div class="card sa-card">
        <div class="card-head"><span class="card-title">Weekly slots</span></div>
        @if (entries.length === 0) {
          <p class="text-muted">No classes scheduled yet.</p>
        } @else {
          <table>
            <thead><tr><th>Day</th><th>Time</th><th>Course</th><th>Session</th><th>Room</th><th>Weeks</th></tr></thead>
            <tbody>
              @for (e of entries; track e.id) {
                <tr>
                  <td>{{ day(e.dayOfWeek) }}</td>
                  <td>{{ e.startTime }}–{{ e.endTime }}</td>
                  <td><span class="sa-dot" [style.background]="e.colorHex"></span>{{ e.courseCode }} · {{ e.courseTitle }}</td>
                  <td class="text-muted">{{ e.sessionLabel }}</td>
                  <td class="text-muted">{{ e.room }}</td>
                  <td class="text-muted">{{ e.weekType === 'ALL' ? 'Every week' : e.weekType === 'ODD' ? 'Odd weeks' : 'Even weeks' }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    }
  `,
})
export class TimetablePageComponent implements OnInit {
  private api = inject(StudentApiService);

  entries: TimetableEntry[] = [];
  sessions: TimetableSession[] = [];
  events: AdminCalendarEvent[] = [];
  date = new Date();
  error: string | null = null;

  ngOnInit(): void {
    forkJoin({ tt: this.api.timetable(), cal: this.api.calendar(90) }).subscribe({
      next: ({ tt, cal }) => {
        const order = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        this.entries = [...tt].sort(
          (a, b) => order.indexOf(a.dayOfWeek) - order.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime),
        );
        this.sessions = toTimetableSessions(tt);
        this.events = toCalendarEvents(cal);
      },
      error: (err) => (this.error = studentApiError(err, 'Could not load your timetable.')),
    });
  }

  day(d: string): string {
    return dayLabel(d);
  }
}
