import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdminCalendarEvent, TimetableSession } from '../core/models';
import { IconComponent } from './icon.component';
import { addDays, addMonths, dateKey, isoWeekday, monthGrid, sameDay, startOfWeek, toHours } from './date-utils';

type View = 'day' | 'week' | 'month';

interface Block {
  key: string;
  title: string;
  subtitle: string;
  color: string;
  top: number;
  height: number;
}

/**
 * Timetable in the spirit of Classter's dashboard calendar: "today" + ‹ ›
 * navigation, a date-range title and a day / week / month switch. Week and
 * day views show an all-day row (assignment deadlines, academic dates) above
 * an hour grid with colour-coded session blocks; month view shows a grid of
 * days with the sessions and deadlines on each.
 */
@Component({
  selector: 'sb-timetable',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="tt-toolbar">
      <div class="tt-nav">
        <button class="tt-btn" (click)="goToday()">today</button>
        <button class="tt-btn icon" (click)="shift(-1)" aria-label="Previous"><sb-icon name="chevron-left" [size]="14"></sb-icon></button>
        <button class="tt-btn icon" (click)="shift(1)" aria-label="Next"><sb-icon name="chevron-right" [size]="14"></sb-icon></button>
      </div>
      <div class="tt-title">{{ title }}</div>
      <div class="tt-views" role="tablist">
        @for (v of views; track v) {
          <button class="tt-view" [class.active]="view === v" (click)="view = v" role="tab" [attr.aria-selected]="view === v">{{ v }}</button>
        }
      </div>
    </div>

    @if (view !== 'month') {
      <div class="tt-grid" [style.grid-template-columns]="columns">
        <!-- day headings -->
        <div class="tt-corner"></div>
        @for (day of days; track dayKey(day)) {
          <div class="tt-day-head" [class.today]="isToday(day)">
            <span class="tt-dow">{{ dow(day) }}</span>
            <span class="tt-date">{{ day.getDate() }}/{{ day.getMonth() + 1 }}</span>
          </div>
        }

        <!-- all-day row -->
        <div class="tt-gutter-label">all-day</div>
        @for (day of days; track dayKey(day)) {
          <div class="tt-allday" [class.today]="isToday(day)">
            @for (e of allDayFor(day); track e.title) {
              <span class="tt-chip" [style.background]="e.colorHex + '22'" [style.color]="e.colorHex" [title]="e.title">{{ e.title }}</span>
            }
          </div>
        }

        <!-- hour grid -->
        <div class="tt-hours" [style.height.px]="bodyHeight">
          @for (h of hours; track h) {
            <span class="tt-hour" [style.top.px]="(h - startHour) * hourHeight">{{ h }}:00</span>
          }
        </div>
        @for (day of days; track dayKey(day)) {
          <div
            class="tt-col"
            [class.today]="isToday(day)"
            [style.height.px]="bodyHeight"
            [style.background-size]="'100% ' + hourHeight + 'px'"
          >
            @for (b of blocksFor(day); track b.key) {
              <div
                class="tt-block"
                [style.top.px]="b.top"
                [style.height.px]="b.height"
                [style.background]="b.color + '1f'"
                [style.border-left-color]="b.color"
                [title]="b.title + ' · ' + b.subtitle"
              >
                <span class="tt-block-title" [style.color]="b.color">{{ b.title }}</span>
                @if (b.height >= 28) {
                  <span class="tt-block-sub">{{ b.subtitle }}</span>
                }
              </div>
            }
            @if (isToday(day) && nowTop !== null) {
              <span class="tt-now" [style.top.px]="nowTop"></span>
            }
          </div>
        }
      </div>
    } @else {
      <div class="tt-month">
        @for (d of weekdayNames; track d) {
          <div class="tt-month-head">{{ d }}</div>
        }
        @for (day of monthDays; track dayKey(day)) {
          <button
            class="tt-month-cell"
            [class.other]="day.getMonth() !== date.getMonth()"
            [class.today]="isToday(day)"
            (click)="openDay(day)"
          >
            <span class="tt-month-num">{{ day.getDate() }}</span>
            @for (e of allDayFor(day).slice(0, 1); track e.title) {
              <span class="tt-chip" [style.background]="e.colorHex + '22'" [style.color]="e.colorHex">{{ e.title }}</span>
            }
            @if (sessionsFor(day).length) {
              <span class="tt-month-sessions">{{ sessionsFor(day).length }} session{{ sessionsFor(day).length > 1 ? 's' : '' }}</span>
            }
          </button>
        }
      </div>
    }

    @if (showLegend) {
    <div class="tt-legend">
      @for (c of legend; track c.code) {
        <span class="tt-legend-item"><span class="tt-dot" [style.background]="c.color"></span>{{ c.code }} · {{ c.title }}</span>
      }
    </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .tt-toolbar {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 10px;
        margin-bottom: 14px;
      }
      .tt-nav {
        display: flex;
        gap: 6px;
      }
      .tt-btn,
      .tt-view {
        border: none;
        background: var(--surface-sunken);
        color: var(--text-secondary);
        font-size: 12px;
        font-weight: 500;
        height: 28px;
        padding: 0 11px;
        border-radius: 9px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .tt-btn.icon {
        width: 28px;
        padding: 0;
      }
      .tt-btn:hover,
      .tt-view:hover {
        color: var(--text-primary);
      }
      .tt-title {
        font-size: 14px;
        font-weight: 500;
        text-align: center;
        white-space: nowrap;
      }
      .tt-views {
        justify-self: end;
        display: flex;
        background: var(--surface-sunken);
        border-radius: 10px;
        padding: 2px;
      }
      .tt-view {
        background: transparent;
        height: 24px;
        padding: 0 10px;
        border-radius: 8px;
        text-transform: capitalize;
      }
      .tt-view.active {
        background: var(--ink);
        color: #fff;
      }

      /* ------------------------------------------------ week / day grid */
      .tt-grid {
        display: grid;
        border-radius: 14px;
        overflow: hidden;
        background: var(--surface);
        box-shadow: inset 0 0 0 1px var(--border);
      }
      .tt-corner,
      .tt-day-head,
      .tt-gutter-label,
      .tt-allday {
        border-bottom: 1px solid var(--border);
      }
      .tt-day-head {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 7px 0 6px;
        border-left: 1px solid var(--border);
      }
      .tt-dow {
        font-size: 10.5px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .tt-date {
        font-size: 12.5px;
        font-weight: 600;
        margin-top: 1px;
      }
      .tt-day-head.today .tt-date {
        color: #fff;
        background: var(--ink);
        border-radius: 999px;
        padding: 0 7px;
      }
      .tt-gutter-label {
        font-size: 10px;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 6px;
      }
      .tt-allday {
        min-height: 30px;
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        border-left: 1px solid var(--border);
        min-width: 0;
      }
      .tt-chip {
        display: block;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
      }
      .tt-hours {
        position: relative;
      }
      .tt-hour {
        position: absolute;
        right: 6px;
        transform: translateY(-50%);
        font-size: 10px;
        color: var(--text-muted);
      }
      .tt-hour:first-child {
        transform: none;
      }
      .tt-col {
        position: relative;
        border-left: 1px solid var(--border);
        background-image: linear-gradient(to bottom, var(--border) 1px, transparent 1px);
      }
      .tt-col.today,
      .tt-allday.today {
        background-color: rgba(31, 43, 216, 0.035);
      }
      .tt-block {
        position: absolute;
        left: 3px;
        right: 3px;
        border-left: 3px solid;
        border-radius: 6px;
        padding: 2px 5px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .tt-block-title {
        font-size: 10.5px;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tt-block-sub {
        font-size: 10px;
        color: var(--text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tt-now {
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--danger);
      }
      .tt-now::before {
        content: '';
        position: absolute;
        left: -4px;
        top: -3px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--danger);
      }

      /* ------------------------------------------------------ month grid */
      .tt-month {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        border-radius: 14px;
        overflow: hidden;
        background: var(--surface);
        box-shadow: inset 0 0 0 1px var(--border);
      }
      .tt-month-head {
        font-size: 10.5px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        text-align: center;
        padding: 7px 0;
        border-bottom: 1px solid var(--border);
      }
      .tt-month-cell {
        min-height: 62px;
        border: none;
        border-bottom: 1px solid var(--border);
        border-right: 1px solid var(--border);
        background: transparent;
        padding: 5px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        text-align: left;
        min-width: 0;
        font-family: inherit;
      }
      .tt-month-cell:hover {
        background: var(--surface-sunken);
      }
      .tt-month-cell.other {
        opacity: 0.4;
      }
      .tt-month-num {
        font-size: 11.5px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .tt-month-cell.today .tt-month-num {
        color: #fff;
        background: var(--ink);
        border-radius: 999px;
        padding: 0 6px;
        align-self: flex-start;
      }
      .tt-month-sessions {
        font-size: 10px;
        color: var(--text-secondary);
      }

      /* ---------------------------------------------------------- legend */
      .tt-legend {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 14px;
        margin-top: 12px;
      }
      .tt-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--text-secondary);
      }
      .tt-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }
    `,
  ],
})
export class TimetableComponent {
  @Input() sessions: TimetableSession[] = [];
  @Input() events: AdminCalendarEvent[] = [];
  @Input() date = new Date();
  @Input() showLegend = true;
  @Output() dateChange = new EventEmitter<Date>();

  view: View = 'week';
  readonly views: View[] = ['day', 'week', 'month'];
  readonly weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  readonly startHour = 8;
  readonly endHour = 22;
  readonly hourHeight = 36;

  get hours(): number[] {
    return Array.from({ length: this.endHour - this.startHour }, (_, i) => this.startHour + i);
  }

  get bodyHeight(): number {
    return (this.endHour - this.startHour) * this.hourHeight;
  }

  get days(): Date[] {
    if (this.view === 'day') return [this.date];
    const monday = startOfWeek(this.date);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }

  get monthDays(): Date[] {
    return monthGrid(this.date);
  }

  get columns(): string {
    return `44px repeat(${this.days.length}, minmax(0, 1fr))`;
  }

  get title(): string {
    const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-GB', opts);
    if (this.view === 'day') return fmt(this.date, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    if (this.view === 'month') return fmt(this.date, { month: 'long', year: 'numeric' });
    const [first, last] = [this.days[0], this.days[6]];
    return `${fmt(first, { day: 'numeric', month: 'short' })} – ${fmt(last, { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }

  get legend(): { code: string; title: string; color: string }[] {
    const seen = new Map<string, { code: string; title: string; color: string }>();
    for (const s of this.sessions) {
      if (!seen.has(s.courseCode)) seen.set(s.courseCode, { code: s.courseCode, title: s.courseTitle, color: s.colorHex });
    }
    return Array.from(seen.values());
  }

  /** Current-time marker position, or null outside the visible hours. */
  get nowTop(): number | null {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    if (h < this.startHour || h > this.endHour) return null;
    return (h - this.startHour) * this.hourHeight;
  }

  dayKey(d: Date): string {
    return dateKey(d);
  }

  dow(d: Date): string {
    return this.weekdayNames[isoWeekday(d) - 1];
  }

  isToday(d: Date): boolean {
    return sameDay(d, new Date());
  }

  sessionsFor(day: Date): TimetableSession[] {
    const wd = isoWeekday(day);
    return this.sessions.filter((s) => s.dayOfWeek === wd);
  }

  /** Deadlines and dateless academic events. Live-session events are already in the timetable. */
  allDayFor(day: Date): AdminCalendarEvent[] {
    const key = dateKey(day);
    return this.events.filter(
      (e) => e.date === key && e.category !== 'Class' && (e.category === 'Assignment' || toHours(e.time) === null),
    );
  }

  blocksFor(day: Date): Block[] {
    const blocks: Block[] = this.sessionsFor(day).map((s) => this.block(`s${s.id}`, s.courseCode, `${s.kind} · ${s.instructor}`, s.colorHex, s.startTime, s.endTime));
    const key = dateKey(day);
    for (const e of this.events) {
      if (e.date !== key || e.category !== 'Meeting') continue;
      const start = toHours(e.time);
      if (start === null) continue;
      blocks.push(this.blockFromHours(`e${e.title}`, e.title, e.category, e.colorHex, start, start + 1));
    }
    return blocks.filter((b) => b.height > 0);
  }

  goToday(): void {
    this.emit(new Date());
  }

  shift(direction: 1 | -1): void {
    if (this.view === 'day') this.emit(addDays(this.date, direction));
    else if (this.view === 'week') this.emit(addDays(this.date, 7 * direction));
    else this.emit(addMonths(this.date, direction));
  }

  openDay(day: Date): void {
    this.view = 'day';
    this.emit(day);
  }

  private emit(d: Date): void {
    this.date = d;
    this.dateChange.emit(d);
  }

  private block(key: string, title: string, subtitle: string, color: string, start: string, end: string): Block {
    return this.blockFromHours(key, title, subtitle, color, toHours(start) ?? 0, toHours(end) ?? 0);
  }

  private blockFromHours(key: string, title: string, subtitle: string, color: string, start: number, end: number): Block {
    const from = Math.max(start, this.startHour);
    const to = Math.min(end, this.endHour);
    return {
      key,
      title,
      subtitle,
      color,
      top: (from - this.startHour) * this.hourHeight + 1,
      height: Math.max(0, (to - from) * this.hourHeight - 2),
    };
  }
}
