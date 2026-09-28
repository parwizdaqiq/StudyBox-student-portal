import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { CourseSummary, DiscussionDetail, DiscussionSummary } from '../../core/student-api.models';

/** Course discussion boards: read threads, reply, or start a new one. */
@Component({
  selector: 'sb-discussions',
  standalone: true,
  imports: [DatePipe, FormsModule],
  template: `
    <div class="page-header">
      <h1>Discussions</h1>
      <button class="btn-primary" (click)="composing = !composing" [disabled]="courses.length === 0">
        {{ composing ? 'Cancel' : '+ New discussion' }}
      </button>
    </div>

    @if (error) {
      <div class="sa-error" style="margin-bottom: 16px">{{ error }}</div>
    }

    @if (composing) {
      <form class="card sa-card sa-form" (ngSubmit)="start()">
        <div class="sa-grid">
          <label class="sa-field">
            <span>Course</span>
            <select [(ngModel)]="draft.courseId" name="courseId" required>
              @for (c of courses; track c.id) {
                <option [ngValue]="c.id">{{ c.code }} — {{ c.title }}</option>
              }
            </select>
          </label>
          <label class="sa-field">
            <span>Title</span>
            <input [(ngModel)]="draft.title" name="title" required placeholder="Question about Assessment 1" />
          </label>
          <label class="sa-field span-all">
            <span>Message</span>
            <textarea [(ngModel)]="draft.body" name="body" required></textarea>
          </label>
        </div>
        <div class="sa-actions"><button class="btn-primary" type="submit" [disabled]="!draft.title || !draft.body || !draft.courseId">Post</button></div>
      </form>
    }

    <div class="layout">
      <div class="card sa-card list">
        @for (t of threads; track t.id) {
          <button class="thread" [class.on]="open?.id === t.id" (click)="select(t)">
            <span class="t-title">{{ t.title }}</span>
            <span class="t-meta">{{ t.courseTitle }} · {{ t.authorName }} · {{ t.replyCount }} posts</span>
          </button>
        } @empty {
          <p class="text-muted">No discussions in your courses yet.</p>
        }
      </div>

      <div class="card sa-card">
        @if (!open) {
          <p class="text-muted">Pick a discussion to read it.</p>
        } @else {
          <div class="card-head">
            <span class="card-title">{{ open.title }}</span>
            <span class="text-muted" style="font-size: 12px">{{ open.courseTitle }}</span>
          </div>
          @for (p of open.posts; track p.id) {
            <div class="post">
              <div class="p-meta"><strong>{{ p.authorName }}</strong> · {{ p.postedAt | date: 'MMM d, HH:mm' }}</div>
              <div class="p-body">{{ p.body }}</div>
            </div>
          }
          @if (open.closedForComments) {
            <p class="text-muted">This discussion is closed for comments.</p>
          } @else {
            <form class="sa-form reply" (ngSubmit)="sendReply()">
              <textarea class="sa-input" rows="3" [(ngModel)]="replyText" name="reply" placeholder="Write a reply…"></textarea>
              <div class="sa-actions"><button class="btn-primary" type="submit" [disabled]="!replyText.trim()">Reply</button></div>
            </form>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
        gap: 18px;
        align-items: start;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .thread {
        text-align: left;
        border: none;
        background: none;
        padding: 10px 12px;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .thread:hover {
        background: var(--surface-sunken);
      }
      .thread.on {
        background: var(--ink);
        color: #fff;
      }
      .thread.on .t-meta {
        color: rgba(255, 255, 255, 0.65);
      }
      .t-title {
        font-size: 13.5px;
        font-weight: 600;
      }
      .t-meta {
        font-size: 12px;
        color: var(--text-muted);
      }
      .post {
        padding: 10px 0;
        border-bottom: 1px solid var(--border);
      }
      .p-meta {
        font-size: 12px;
        color: var(--text-muted);
      }
      .p-body {
        margin-top: 4px;
        font-size: 13px;
        white-space: pre-line;
      }
      .reply {
        margin-top: 14px;
      }
      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DiscussionsComponent implements OnInit {
  private api = inject(StudentApiService);

  courses: CourseSummary[] = [];
  threads: DiscussionSummary[] = [];
  open: DiscussionDetail | null = null;
  composing = false;
  draft = { courseId: null as number | null, title: '', body: '' };
  replyText = '';
  error: string | null = null;

  ngOnInit(): void {
    this.api.courses().subscribe({
      next: (c) => {
        this.courses = c;
        this.draft.courseId = c[0]?.id ?? null;
      },
    });
    this.load();
  }

  load(): void {
    this.api.discussions().subscribe({
      next: (t) => (this.threads = t),
      error: (err) => (this.error = studentApiError(err, 'Could not load discussions.')),
    });
  }

  select(t: DiscussionSummary): void {
    this.api.discussion(t.id).subscribe({ next: (d) => (this.open = d) });
  }

  start(): void {
    if (!this.draft.courseId) return;
    this.api.startDiscussion(this.draft.courseId, this.draft.title, this.draft.body).subscribe({
      next: (d) => {
        this.open = d;
        this.composing = false;
        this.draft = { courseId: this.courses[0]?.id ?? null, title: '', body: '' };
        this.load();
      },
      error: (err) => (this.error = studentApiError(err, 'Could not start the discussion.')),
    });
  }

  sendReply(): void {
    if (!this.open || !this.replyText.trim()) return;
    this.api.reply(this.open.id, this.replyText.trim()).subscribe({
      next: (d) => {
        this.open = d;
        this.replyText = '';
        this.load();
      },
      error: (err) => (this.error = studentApiError(err, 'Could not post your reply.')),
    });
  }
}
