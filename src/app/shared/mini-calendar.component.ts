import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdminCalendarEvent } from '../core/models';
import { IconComponent } from './icon.component';
import { addMonths, dateKey, monthGrid, parseKey, sameDay } from './date-utils';

/**
 * Compact month calendar + the next few events. Days that have deadlines or
 * academic events get a dot; clicking a day moves the dashboard timetable to it.
 */
@Component({
  selector: 'sb-mini-calendar',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="mc-head">
      <span class="mc-title">{{ monthTitle }}</span>
      <span class="mc-nav">
        <button class="mc-btn" (click)="moveMonth(-1)" aria-label="Previous month"><sb-icon name="chevron-left" [size]="14"></sb-icon></button>
        <button class="mc-btn" (click)="moveMonth(1)" aria-label="Next month"><sb-icon name="chevron-right" [size]="14"></sb-icon></button>
      </span>
    </div>

    <div class="mc-grid">
      @for (d of weekdayLetters; track $index) {
        <span class="mc-dow">{{ d }}</span>
      }
      @for (day of days; track key(day)) {
        <button
          class="mc-day"
          [class.other]="day.getMonth() !== shownMonth.getMonth()"
          [class.today]="isToday(day)"
          [class.selected]="isSelected(day)"
          (click)="select(day)"
        >
          {{ day.getDate() }}
          @if (hasEvent(day)) {
            <span class="mc-dot"></span>
          }
        </button>
      }
    </div>

    <div class="mc-upcoming">
      <div class="mc-sub">Upcoming</div>
      @for (e of upcoming; track e.title + e.date) {
        <button class="mc-event" (click)="select(parse(e.date))">
          <span class="mc-date-tile">
            <span class="mc-date-month">{{ monthShort(e.date) }}</span>
            <span class="mc-date-day">{{ dayNum(e.date) }}</span>
          </span>
          <span class="mc-event-body">
            <span class="mc-event-title">{{ e.title }}</span>
            <span class="mc-event-meta">{{ e.courseTitle || e.category }} · {{ e.time }}</span>
          </span>
        </button>
      } @empty {
        <div class="mc-empty">Nothing scheduled.</div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .mc-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
      }
      .mc-title {
        font-size: 14px;
        font-weight: 500;
      }
      .mc-nav {
        display: flex;
        gap: 4px;
      }
      .mc-btn {
        width: 26px;
        height: 26px;
        border: none;
        border-radius: 8px;
        background: var(--surface-sunken);
        color: var(--text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .mc-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 2px;
      }
      .mc-dow {
        font-size: 10.5px;
        color: var(--text-muted);
        text-align: center;
        padding-bottom: 4px;
      }
      .mc-day {
        position: relative;
        height: 30px;
        border: none;
        background: transparent;
        border-radius: 9px;
        font-family: inherit;
        font-size: 12px;
        color: var(--text-primary);
      }
      .mc-day:hover {
        background: var(--surface-sunken);
      }
      .mc-day.other {
        color: var(--text-muted);
        opacity: 0.55;
      }
      .mc-day.today {
        box-shadow: inset 0 0 0 1.5px var(--ink);
        font-weight: 600;
      }
      .mc-day.selected {
        background: var(--ink);
        color: #fff;
        font-weight: 600;
      }
      .mc-dot {
        position: absolute;
        bottom: 3px;
        left: 50%;
        width: 4px;
        height: 4px;
        margin-left: -2px;
        border-radius: 50%;
        background: var(--primary);
      }
      .mc-day.selected .mc-dot {
        background: #fff;
      }
      .mc-upcoming {
        margin-top: 16px;
        padding-top: 14px;
        border-top: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .mc-sub {
        font-size: 11px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .mc-event {
        display: flex;
        align-items: center;
        gap: 10px;
        border: none;
        background: none;
        padding: 0;
        text-align: left;
        font-family: inherit;
        min-width: 0;
      }
      .mc-date-tile {
        width: 36px;
        flex-shrink: 0;
        border-radius: 10px;
        background: var(--surface-sunken);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 3px 0;
      }
      .mc-date-month {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: var(--primary);
        text-transform: uppercase;
      }
      .mc-date-day {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .mc-event-body {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .mc-event-title,
      .mc-event-meta {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mc-event-title {
        font-size: 12.5px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .mc-event-meta {
        font-size: 11px;
        color: var(--text-muted);
      }
      .mc-empty {
        font-size: 12px;
        color: var(--text-muted);
      }
    `,
  ],
})
export class MiniCalendarComponent {
  @Input() events: AdminCalendarEvent[] = [];
  @Input() set date(value: Date) {
    this.selected = value;
    this.shownMonth = new Date(value.getFullYear(), value.getMonth(), 1);
  }
  @Output() dateChange = new EventEmitter<Date>();

  selected = new Date();
  shownMonth = new Date(this.selected.getFullYear(), this.selected.getMonth(), 1);
  readonly weekdayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  get days(): Date[] {
    return monthGrid(this.shownMonth);
  }

  get monthTitle(): string {
    return this.shownMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  /** Next three non-session events from today on. */
  get upcoming(): AdminCalendarEvent[] {
    const today = dateKey(new Date());
    return this.events.filter((e) => e.category !== 'Class' && e.date >= today).slice(0, 3);
  }

  key(d: Date): string {
    return dateKey(d);
  }

  parse(k: string): Date {
    return parseKey(k);
  }

  monthShort(k: string): string {
    return parseKey(k).toLocaleDateString('en-GB', { month: 'short' });
  }

  dayNum(k: string): number {
    return parseKey(k).getDate();
  }

  isToday(d: Date): boolean {
    return sameDay(d, new Date());
  }

  isSelected(d: Date): boolean {
    return sameDay(d, this.selected);
  }

  hasEvent(d: Date): boolean {
    const k = dateKey(d);
    return this.events.some((e) => e.date === k && e.category !== 'Class');
  }

  moveMonth(direction: 1 | -1): void {
    this.shownMonth = addMonths(this.shownMonth, direction);
  }

  select(d: Date): void {
    this.selected = d;
    this.shownMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    this.dateChange.emit(d);
  }
}
