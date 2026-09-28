import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { Assignment, CourseSummary, Dashboard, GradeCourse } from '../../core/student-api.models';
import { AdminCalendarEvent, TimetableSession } from '../../core/models';
import { toCalendarEvents, toTimetableSessions } from '../../core/student-mappers';
import { IconComponent } from '../../shared/icon.component';
import { RadarAxis, RadarChartComponent } from '../../shared/radar-chart.component';
import { ArtTileComponent, ArtVariant } from '../../shared/art-tile.component';
import { TimetableComponent } from '../../shared/timetable.component';
import { MiniCalendarComponent } from '../../shared/mini-calendar.component';

const ART: ArtVariant[] = ['sea', 'dusk', 'hills', 'dunes', 'reef'];

/**
 * The signed-in student's home page, built entirely from the live backend:
 *  ┌ welcome + counters (courses · pending work · attendance · average grade)  ┐
 *  ├ Learning progress (grade per course)    ┐ ┌ My courses (tiles)            ┤
 *  ├ Timetable (day / week / month)          ┐ ┌ Calendar + course list        ┤
 *  └ Upcoming assignments                    ┘ └ Announcements                 ┘
 */
@Component({
  selector: 'sb-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, IconComponent, RadarChartComponent, ArtTileComponent, TimetableComponent, MiniCalendarComponent],
  template: `
    @if (error) {
      <div class="card welcome"><div class="text-secondary">{{ error }}</div></div>
    } @else if (!data) {
      <div class="card welcome"><div class="text-muted">Loading your dashboard…</div></div>
    } @else {
      <div class="grid">
        <div class="card welcome">
          <div>
            <h1>Welcome back, {{ firstName }}</h1>
            <p>{{ data.student.programme }} · {{ data.student.studentNumber }}</p>
          </div>
          @if (courses.length === 0) {
            <span class="status-pill">You're not enrolled in any course yet — your administrator will add you.</span>
          }
        </div>

        <div class="counters">
          @for (c of counters; track c.label) {
            <a class="card counter" [routerLink]="c.link">
              <span class="counter-icon" [style.background]="c.tint" [style.color]="c.accent">
                <sb-icon [name]="c.icon" [size]="16"></sb-icon>
              </span>
              <span class="counter-body">
                <span class="counter-value">{{ c.value }}</span>
                <span class="counter-label">{{ c.label }}</span>
              </span>
              <span class="counter-link">{{ c.linkLabel }} <sb-icon name="arrow-right" [size]="12"></sb-icon></span>
            </a>
          }
        </div>

        <section class="card panel progress-panel">
          <div class="card-head">
            <h2 class="card-title">Learning Progress</h2>
            <a routerLink="/student-portal/grades" class="see-all-link">Grades</a>
          </div>
          <div class="progress-body">
            <div class="progress-stats">
              <div class="overall-row">
                <span class="muted-label">Weighted average</span>
              </div>
              <div class="overall-value">
                <span class="big">{{ data.stats.averageGradePercent !== null ? data.stats.averageGradePercent + '%' : '—' }}</span>
                <span class="big-suffix">{{ data.stats.averageGradePercent !== null ? 'across graded courses' : 'no grades published yet' }}</span>
              </div>
              <div class="stat-rows">
                @for (row of statRows; track row.label) {
                  <div class="stat-row">
                    <span class="stat-label">{{ row.label }}</span>
                    <span class="stat-sep"></span>
                    <span class="stat-value">{{ row.value }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="progress-radar">
              @if (radarAxes.length >= 3) {
                <sb-radar-chart [axes]="radarAxes" [min]="0"></sb-radar-chart>
              } @else if (grades.length) {
                <div class="bars">
                  @for (g of grades; track g.courseId) {
                    <div class="bar-row">
                      <span>{{ g.courseCode }}</span>
                      <span class="bar-track"><span class="bar-fill" [style.width.%]="g.totalPercent ?? 0" [style.background]="g.colorHex"></span></span>
                      <span class="text-secondary">{{ g.totalPercent !== null ? g.totalPercent + '%' : '—' }}</span>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">Your grades will appear here once they're published.</div>
              }
            </div>
          </div>
        </section>

        <section class="card panel groups-panel">
          <div class="card-head">
            <h2 class="card-title">My Courses</h2>
            <a routerLink="/student-portal/courses" class="see-all-link">All</a>
          </div>
          @if (courses.length === 0) {
            <div class="empty-state">No courses yet.</div>
          } @else {
            <div class="group-grid">
              @for (course of courses.slice(0, 3); track course.id; let i = $index) {
                <a [routerLink]="['/student-portal/courses', course.id]" class="group-tile">
                  <sb-art class="group-art" [variant]="art(i)" [seed]="course.id * 7" [shade]="true"></sb-art>
                  <span class="group-caption">
                    <span class="group-name">{{ course.title }}</span>
                    <span class="group-count">{{ course.code }} · {{ course.credits }} ECTS</span>
                  </span>
                </a>
              }
              <a routerLink="/student-portal/courses" class="group-tile see-all">See all courses</a>
            </div>
          }
        </section>

        <section class="card panel timetable-panel">
          <div class="card-head">
            <h2 class="card-title">Timetable</h2>
            <a routerLink="/student-portal/timetable" class="see-all-link">Full timetable</a>
          </div>
          <sb-timetable
            [sessions]="timetable"
            [events]="calendarEvents"
            [date]="selectedDate"
            [showLegend]="false"
            (dateChange)="selectedDate = $event"
          ></sb-timetable>
        </section>

        <section class="card panel calendar-panel">
          <div class="card-head">
            <h2 class="card-title">Calendar</h2>
            <a routerLink="/student-portal/calendar" class="see-all-link">Open</a>
          </div>
          <sb-mini-calendar [events]="calendarEvents" [date]="selectedDate" (dateChange)="selectedDate = $event"></sb-mini-calendar>
          <div class="course-list">
            <div class="course-list-head">
              <span>Courses</span>
              <a routerLink="/student-portal/courses">All courses</a>
            </div>
            @for (course of courses; track course.id) {
              <a class="course-row" [routerLink]="['/student-portal/courses', course.id]" [title]="course.title">
                <span class="course-dot" [style.background]="course.colorHex + '26'" [style.color]="course.colorHex">
                  <sb-icon name="courses" [size]="13"></sb-icon>
                </span>
                <span class="course-info">
                  <span class="course-title">{{ course.title }}</span>
                  <span class="course-meta">{{ course.code }} · {{ course.instructorNames.join(', ') || 'Instructor TBA' }}</span>
                </span>
              </a>
            } @empty {
              <div class="empty-state">—</div>
            }
          </div>
        </section>

        <section class="card panel tests-panel">
          <div class="card-head">
            <h2 class="card-title">Upcoming Assignments</h2>
            <a routerLink="/student-portal/assignments" class="see-all-link">See all</a>
          </div>
          <div class="test-rows">
            @for (a of data.upcomingAssignments; track a.id; let i = $index) {
              <div class="test-row">
                <div class="test-name" [title]="a.title">
                  <sb-art class="test-avatar" [variant]="art(i)" [seed]="a.id * 13"></sb-art>
                  <span>{{ a.title }}</span>
                </div>
                <div class="test-status">{{ a.courseCode }}</div>
                <div class="test-score">{{ a.pointsPossible }} pts</div>
                <div class="test-duration">
                  <sb-icon name="alarm" [size]="14"></sb-icon>
                  {{ a.dueAt ? (a.dueAt | date: 'MMM d, HH:mm') : 'No due date' }}
                </div>
                <div class="test-date"><span class="status-pill">{{ statusLabel(a) }}</span></div>
                <a routerLink="/student-portal/assignments" class="icon-btn-plain" aria-label="Open assignments">
                  <sb-icon name="more-vertical" [size]="16"></sb-icon>
                </a>
              </div>
            } @empty {
              <div class="empty-state">Nothing due — you're all caught up.</div>
            }
          </div>
        </section>

        <section class="card panel attendance-panel">
          <div class="card-head">
            <h2 class="card-title">Announcements</h2>
            <a routerLink="/student-portal/announcements" class="see-all-link">All</a>
          </div>
          @for (n of data.announcements; track n.id) {
            <div class="ann-row">
              <div class="ann-title">{{ n.title }}</div>
              <div class="ann-meta">{{ n.courseTitle }} · {{ n.postedAt | date: 'MMM d' }}</div>
              <div class="ann-body">{{ n.body }}</div>
            </div>
          } @empty {
            <div class="empty-state">No announcements yet.</div>
          }
        </section>
      </div>
    }
  `,
  styles: [
    `
      .empty-state {
        padding: 18px 2px;
        color: var(--text-muted);
        font-size: 13px;
      }
      .welcome {
        grid-column: 1 / -1;
        padding: 22px 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .welcome h1 {
        font-size: 20px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      .welcome p {
        margin-top: 4px;
        font-size: 13px;
        color: var(--text-secondary);
      }
      .bars {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
      }
      .bar-row {
        display: grid;
        grid-template-columns: 90px 1fr 48px;
        align-items: center;
        gap: 10px;
        font-size: 12.5px;
      }
      .bar-track {
        height: 8px;
        border-radius: 8px;
        background: var(--surface-sunken);
        overflow: hidden;
      }
      .bar-fill {
        display: block;
        height: 100%;
        border-radius: 8px;
      }
      .ann-row {
        padding: 10px 0;
        border-bottom: 1px solid var(--border);
      }
      .ann-row:last-child {
        border-bottom: none;
      }
      .ann-title {
        font-size: 13px;
        font-weight: 600;
      }
      .ann-meta {
        font-size: 11.5px;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .ann-body {
        font-size: 12.5px;
        color: var(--text-secondary);
        margin-top: 5px;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .status-pill {
        font-size: 11.5px;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 20px;
        background: var(--surface-sunken);
        color: var(--text-secondary);
        white-space: nowrap;
      }
      .counters {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 21px;
      }
      .counter {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: auto auto;
        align-items: center;
        column-gap: 12px;
        row-gap: 6px;
        padding: 14px 18px;
        border-radius: 20px;
        transition: transform 0.15s ease;
      }
      .counter:hover {
        transform: translateY(-1px);
      }
      .counter-icon {
        width: 34px;
        height: 34px;
        border-radius: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .counter-body {
        display: flex;
        align-items: baseline;
        gap: 7px;
        min-width: 0;
      }
      .counter-value {
        font-size: 24px;
        font-weight: 500;
        letter-spacing: -0.02em;
        line-height: 1;
      }
      .counter-label {
        font-size: 13px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .counter-link {
        grid-column: 2;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11.5px;
        font-weight: 500;
        color: var(--primary);
      }
      .calendar-panel .card-head {
        margin-bottom: 12px;
      }
      .course-list {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .course-list-head {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .course-list-head a {
        text-transform: none;
        letter-spacing: 0;
        color: var(--primary);
        font-weight: 500;
      }
      .course-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .course-dot {
        width: 28px;
        height: 28px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .course-info {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .course-title,
      .course-meta {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .course-title {
        font-size: 12.5px;
        font-weight: 600;
      }
      .course-meta {
        font-size: 11px;
        color: var(--text-muted);
      }
      .grid {
        display: grid;
        grid-template-columns: minmax(0, 2.18fr) minmax(0, 1fr);
        gap: 21px;
      }
      .panel {
        padding: 24px 25px 25px;
        display: flex;
        flex-direction: column;
      }
      .card-head.no-line {
        border-bottom: none;
        margin-bottom: 26px;
      }

      /* ------------------------------------------------ progress overview */
      .period {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--text-secondary);
      }
      .period select {
        appearance: none;
        -webkit-appearance: none;
        border: none;
        background: transparent;
        font-family: inherit;
        font-size: 13px;
        color: var(--text-secondary);
        padding-right: 1px;
        cursor: pointer;
        outline: none;
      }
      .period sb-icon {
        pointer-events: none;
      }
      .progress-body {
        display: grid;
        grid-template-columns: minmax(0, 250px) minmax(0, 1fr);
        gap: 20px;
        align-items: center;
        flex: 1;
      }
      .overall-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .muted-label {
        font-size: 13px;
        color: var(--text-muted);
      }
      .trend-pill {
        background: var(--lime);
        color: #26300a;
        font-size: 12px;
        font-weight: 500;
        padding: 3px 7px;
        border-radius: 999px;
      }
      .overall-value {
        display: flex;
        align-items: baseline;
        gap: 7px;
        margin-top: 7px;
      }
      .big {
        font-size: 42px;
        font-weight: 400;
        letter-spacing: -0.03em;
        line-height: 1;
      }
      .big-suffix {
        font-size: 18px;
        font-weight: 400;
      }
      .stat-rows {
        display: flex;
        flex-direction: column;
        gap: 18px;
        margin: 31px 0 28px;
      }
      .stat-row {
        display: grid;
        grid-template-columns: 1fr 1px 48px;
        align-items: center;
        gap: 14px;
        font-size: 13px;
      }
      .stat-sep {
        height: 20px;
        background: var(--border);
      }
      .stat-value {
        font-weight: 600;
        text-align: right;
      }
      .goal-pill {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface-sunken);
        border-radius: 14px;
        padding: 4px 13px 4px 4px;
        font-size: 13px;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
      }
      .goal-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .goal-pill strong {
        font-weight: 600;
      }
      .goal-check {
        width: 30px;
        height: 30px;
        border-radius: 10px;
        background: var(--ink);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .progress-radar {
        height: 270px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .progress-radar sb-radar-chart {
        width: 100%;
        max-width: 380px;
        height: 100%;
      }

      /* ------------------------------------------------------ study groups */
      .group-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
        flex: 1;
      }
      .group-tile {
        position: relative;
        border-radius: 18px;
        overflow: hidden;
        min-height: 118px;
        display: flex;
        align-items: flex-end;
        box-shadow: 0 10px 22px -14px rgba(20, 20, 40, 0.4);
        transition: transform 0.15s ease;
      }
      .group-tile:hover {
        transform: translateY(-2px);
      }
      .group-art {
        position: absolute;
        inset: 0;
      }
      .group-caption {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 3px;
        padding: 0 13px 13px;
        color: #fff;
      }
      .group-name {
        font-size: 13px;
        font-weight: 600;
      }
      .group-count {
        font-size: 12px;
        opacity: 0.9;
      }
      .group-tile.see-all {
        align-items: center;
        justify-content: center;
        background: var(--surface-sunken);
        font-size: 13px;
        font-weight: 500;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03);
      }

      /* ----------------------------------------------------- recent tests */
      .see-all-link {
        font-size: 13px;
        color: var(--text-secondary);
      }
      .see-all-link:hover {
        color: var(--text-primary);
      }
      .test-rows {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
        flex: 1;
      }
      .test-row {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1.05fr) minmax(0, 0.9fr) minmax(0, 0.95fr) minmax(0, 0.8fr) 28px;
        align-items: center;
        gap: 8px;
        min-height: 46px;
        font-size: 13px;
      }
      .test-name {
        display: flex;
        align-items: center;
        gap: 11px;
        font-weight: 600;
        min-width: 0;
      }
      .test-name span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .test-avatar {
        width: 37px;
        height: 37px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .test-status,
      .test-duration {
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .status-icon,
      .test-duration sb-icon {
        color: #b9b9c0;
        display: flex;
      }

      /* -------------------------------------------------- attendance rate */
      .att-rows {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .att-row {
        display: grid;
        grid-template-columns: 32px minmax(0, 1fr) 58px 34px;
        align-items: center;
        gap: 8px;
        font-size: 13px;
      }
      .att-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.6);
      }
      .att-name {
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .att-track {
        height: 5px;
        border-radius: 3px;
        background: #dcdce2;
        overflow: hidden;
      }
      .att-fill {
        display: block;
        height: 100%;
        background: var(--primary);
        border-radius: 3px;
      }
      .att-pct {
        text-align: right;
      }
      .att-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: auto;
        padding-top: 15px;
        border-top: 1px solid var(--border);
        font-size: 13px;
      }
      .att-rows + .att-footer {
        margin-top: 20px;
      }
      .att-footer strong {
        font-weight: 600;
      }
      .att-footer-sep {
        width: 1px;
        height: 20px;
        background: var(--border);
      }
      .report-btn {
        display: block;
        text-align: center;
        margin-top: 15px;
        font-weight: 500;
      }

      /* Stack stats above the radar only while the panel is squeezed into the
         two-column grid, or on phones. */
      @media (max-width: 1280px) and (min-width: 1101px), (max-width: 700px) {
        .progress-body {
          grid-template-columns: 1fr;
        }
        .progress-stats {
          max-width: 380px;
        }
      }
      @media (max-width: 1100px) {
        .grid {
          grid-template-columns: 1fr;
        }
        .counters {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .panel {
          padding: 18px;
        }
        .test-row {
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 0.8fr) 28px;
        }
        .test-duration,
        .test-date {
          display: none;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private api = inject(StudentApiService);

  data: Dashboard | null = null;
  courses: CourseSummary[] = [];
  grades: GradeCourse[] = [];
  timetable: TimetableSession[] = [];
  calendarEvents: AdminCalendarEvent[] = [];
  selectedDate = new Date();
  error: string | null = null;

  counters: { label: string; value: string; icon: string; tint: string; accent: string; link: string; linkLabel: string }[] = [];
  statRows: { label: string; value: string }[] = [];
  radarAxes: RadarAxis[] = [];

  ngOnInit(): void {
    forkJoin({
      dashboard: this.api.dashboard(),
      courses: this.api.courses(),
      grades: this.api.grades(),
      timetable: this.api.timetable(),
      calendar: this.api.calendar(60),
    }).subscribe({
      next: (res) => {
        this.data = res.dashboard;
        this.courses = res.courses;
        this.grades = res.grades;
        this.timetable = toTimetableSessions(res.timetable);
        this.calendarEvents = toCalendarEvents(res.calendar);
        this.build();
      },
      error: (err) => (this.error = studentApiError(err, 'Could not load your dashboard.')),
    });
  }

  get firstName(): string {
    return this.data?.student.fullName.split(' ')[0] ?? '';
  }

  art(i: number): ArtVariant {
    return ART[i % ART.length];
  }

  statusLabel(a: Assignment): string {
    switch (a.status) {
      case 'SUBMITTED':
        return 'Submitted';
      case 'GRADED':
        return 'Graded';
      case 'MISSING':
        return 'Missing';
      default:
        return 'To do';
    }
  }

  private build(): void {
    const d = this.data!;
    const avg = d.stats.averageGradePercent;
    this.counters = [
      { label: 'Courses', value: String(d.stats.activeCourses), icon: 'courses', tint: 'var(--tint-1)', accent: 'var(--tint-1-accent)', link: '/student-portal/courses', linkLabel: 'My courses' },
      { label: 'Pending work', value: String(d.stats.pendingAssignments), icon: 'clipboard-check', tint: 'var(--tint-2)', accent: 'var(--tint-2-accent)', link: '/student-portal/assignments', linkLabel: 'Assignments' },
      { label: 'Attendance', value: `${Math.round(d.stats.attendanceRatePercent)}%`, icon: 'attendance', tint: 'var(--tint-3)', accent: 'var(--tint-3-accent)', link: '/student-portal/attendance', linkLabel: 'Attendance' },
      { label: 'Average grade', value: avg !== null ? `${avg}%` : '—', icon: 'grades', tint: 'var(--tint-4)', accent: 'var(--tint-4-accent)', link: '/student-portal/grades', linkLabel: 'Grades' },
    ];
    const credits = this.courses.reduce((sum, c) => sum + (c.credits || 0), 0);
    const graded = this.grades.reduce(
      (n, g) => n + g.categories.reduce((m, cat) => m + cat.items.filter((i) => i.posted && i.scoreEarned !== null).length, 0),
      0,
    );
    this.statRows = [
      { label: 'Credits this term', value: `${credits} ECTS` },
      { label: 'Published grades', value: String(graded) },
      { label: 'Classes this week', value: String(this.timetable.length) },
      { label: 'Assignments due', value: String(d.stats.pendingAssignments) },
    ];
    this.radarAxes = this.grades
      .filter((g) => g.totalPercent !== null)
      .slice(0, 6)
      .map((g) => ({ label: g.courseCode, value: g.totalPercent ?? 0 }));
  }
}
