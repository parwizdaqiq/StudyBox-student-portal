import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { Announcement } from '../../core/student-api.models';

/** Programme-wide notices plus those posted to the student's courses. */
@Component({
  selector: 'sb-announcements',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-header">
      <h1>Announcements</h1>
    </div>
    <div class="card sa-card">
      @if (error) {
        <p class="text-secondary">{{ error }}</p>
      } @else if (items === null) {
        <p class="text-muted">Loading…</p>
      } @else {
        @for (a of items; track a.id) {
          <div class="ann">
            <div class="title">{{ a.title }}</div>
            <div class="meta">{{ a.courseTitle }} · {{ a.postedBy }} · {{ a.postedAt | date: 'MMM d, y, HH:mm' }}</div>
            <p class="body">{{ a.body }}</p>
          </div>
        } @empty {
          <p class="text-muted">No announcements yet.</p>
        }
      }
    </div>
  `,
  styles: [
    `
      .ann {
        padding: 14px 0;
        border-bottom: 1px solid var(--border);
      }
      .ann:last-child {
        border-bottom: none;
      }
      .title {
        font-weight: 600;
        font-size: 14.5px;
      }
      .meta {
        font-size: 12px;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .body {
        margin-top: 8px;
        font-size: 13.5px;
        color: var(--text-secondary);
        white-space: pre-line;
      }
    `,
  ],
})
export class AnnouncementsComponent implements OnInit {
  private api = inject(StudentApiService);
  items: Announcement[] | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.api.announcements().subscribe({
      next: (r) => (this.items = r),
      error: (err) => (this.error = studentApiError(err, 'Could not load announcements.')),
    });
  }
}
