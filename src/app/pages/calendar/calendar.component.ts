import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { CalendarEvent } from '../../core/student-api.models';
import { AdminCalendarEvent } from '../../core/models';
import { toCalendarEvents } from '../../core/student-mappers';
import { MiniCalendarComponent } from '../../shared/mini-calendar.component';

interface DayGroup {
  date: string;
  events: CalendarEvent[];
}

/** Classes and deadlines for the next two months, merged into one agenda. */
@Component({
  selector: 'sb-calendar',
  standalone: true,
  imports: [DatePipe, MiniCalendarComponent],
  template: `
    <div class="page-header">
      <h1>Calendar</h1>
    </div>

    @if (error) {
      <div class="card sa-card text-secondary">{{ error }}</div>
    } @else {
      <div class="layout">
        <div class="card sa-card">
          <div class="card-head"><span class="card-title">Agenda</span></div>
          @for (g of groups; track g.date) {
            <div class="day">
              <div class="day-label">{{ g.date | date: 'EEEE, MMM d' }}</div>
              @for (e of g.events; track $index) {
                <div class="event">
                  <span class="bar" [style.background]="e.colorHex"></span>
                  <span class="time">{{ e.time }}</span>
                  <span class="title">{{ e.title }}</span>
                  <span class="cat">{{ e.category }}</span>
                </div>
              }
            </div>
          } @empty {
            <p class="text-muted">Nothing scheduled.</p>
          }
        </div>
        <div class="card sa-card">
          <sb-mini-calendar [events]="miniEvents" [date]="date" (dateChange)="date = $event"></sb-mini-calendar>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
        gap: 18px;
        align-items: start;
      }
      .day {
        padding: 10px 0;
        border-bottom: 1px solid var(--border);
      }
      .day:last-child {
        border-bottom: none;
      }
      .day-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 6px;
      }
      .event {
        display: grid;
        grid-template-columns: 4px 52px 1fr auto;
        gap: 10px;
        align-items: center;
        padding: 5px 0;
        font-size: 13px;
      }
      .bar {
        height: 20px;
        border-radius: 4px;
      }
      .time {
        color: var(--text-secondary);
        font-variant-numeric: tabular-nums;
      }
      .cat {
        font-size: 11.5px;
        color: var(--text-muted);
      }
      @media (max-width: 1000px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CalendarComponent implements OnInit {
  private api = inject(StudentApiService);

  groups: DayGroup[] = [];
  miniEvents: AdminCalendarEvent[] = [];
  date = new Date();
  error: string | null = null;

  ngOnInit(): void {
    this.api.calendar(60).subscribe({
      next: (events) => {
        this.miniEvents = toCalendarEvents(events);
        const byDate = new Map<string, CalendarEvent[]>();
        for (const e of [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))) {
          if (!byDate.has(e.date)) byDate.set(e.date, []);
          byDate.get(e.date)!.push(e);
        }
        this.groups = [...byDate.entries()].map(([date, evs]) => ({ date, events: evs }));
      },
      error: (err) => (this.error = studentApiError(err, 'Could not load your calendar.')),
    });
  }
}
