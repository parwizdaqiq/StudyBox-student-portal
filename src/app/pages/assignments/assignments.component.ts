import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { Assignment } from '../../core/student-api.models';

type Filter = 'ALL' | Assignment['status'];

/** Every assignment across the student's courses, with status filters. */
@Component({
  selector: 'sb-assignments',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-header">
      <h1>Assignments</h1>
    </div>

    <div class="filters">
      @for (f of filters; track f.value) {
        <button class="chip" [class.on]="filter === f.value" (click)="filter = f.value">{{ f.label }} ({{ count(f.value) }})</button>
      }
    </div>

    <div class="card sa-card">
      @if (error) {
        <p class="text-secondary">{{ error }}</p>
      } @else if (assignments === null) {
        <p class="text-muted">Loading…</p>
      } @else if (visible().length === 0) {
        <p class="text-muted">Nothing here.</p>
      } @else {
        <div class="sa-table-wrap">
          <table>
            <thead>
              <tr><th>Assignment</th><th>Course</th><th>Type</th><th>Due</th><th>Score</th><th>Status</th></tr>
            </thead>
            <tbody>
              @for (a of visible(); track a.id) {
                <tr>
                  <td>{{ a.title }}</td>
                  <td><span class="sa-dot" [style.background]="a.colorHex"></span>{{ a.courseCode }}</td>
                  <td class="text-muted">{{ a.type }}</td>
                  <td class="text-muted">{{ a.dueAt ? (a.dueAt | date: 'EEE MMM d, HH:mm') : '—' }}</td>
                  <td>{{ a.scoreEarned !== null ? a.scoreEarned + ' / ' + a.pointsPossible : a.pointsPossible + ' pts' }}</td>
                  <td>
                    <span class="badge" [class.badge-info]="a.status === 'NOT_STARTED'" [class.badge-warning]="a.status === 'SUBMITTED'" [class.badge-success]="a.status === 'GRADED'" [class.badge-danger]="a.status === 'MISSING'">{{ label(a.status) }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .filters {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .chip {
        border: none;
        background: var(--surface);
        box-shadow: var(--shadow-card);
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 12.5px;
        font-weight: 500;
        color: var(--text-secondary);
      }
      .chip.on {
        background: var(--ink);
        color: #fff;
      }
    `,
  ],
})
export class AssignmentsComponent implements OnInit {
  private api = inject(StudentApiService);

  assignments: Assignment[] | null = null;
  error: string | null = null;
  filter: Filter = 'ALL';
  filters: { value: Filter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'NOT_STARTED', label: 'To do' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'GRADED', label: 'Graded' },
    { value: 'MISSING', label: 'Missing' },
  ];

  ngOnInit(): void {
    this.api.assignments().subscribe({
      next: (r) => (this.assignments = r),
      error: (err) => (this.error = studentApiError(err, 'Could not load assignments.')),
    });
  }

  visible(): Assignment[] {
    return (this.assignments ?? []).filter((a) => this.filter === 'ALL' || a.status === this.filter);
  }

  count(f: Filter): number {
    return (this.assignments ?? []).filter((a) => f === 'ALL' || a.status === f).length;
  }

  label(s: Assignment['status']): string {
    return this.filters.find((f) => f.value === s)?.label ?? s;
  }
}
