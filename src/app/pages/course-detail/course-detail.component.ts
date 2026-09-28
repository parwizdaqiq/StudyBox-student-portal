import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { CourseDetail } from '../../core/student-api.models';
import { IconComponent } from '../../shared/icon.component';

const ITEM_ICON: Record<string, string> = {
  VIDEO: 'smartphone',
  ATTACHMENT: 'file-text',
  QUIZ: 'check',
  LAB: 'code',
  EXTERNAL_LINK: 'arrow-right',
};

/** One course: attendance tally, who teaches it, and its weekly modules. */
@Component({
  selector: 'sb-course-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, IconComponent],
  template: `
    <div class="page-header">
      <h1>
        <a routerLink="/student-portal/courses" class="text-muted">Courses</a>
        @if (detail) { <span class="text-muted"> / </span>{{ detail.course.title }} }
      </h1>
    </div>

    @if (error) {
      <div class="card sa-card text-secondary">{{ error }}</div>
    } @else if (!detail) {
      <div class="card sa-card text-muted">Loading…</div>
    } @else {
      <div class="layout">
        <div>
          <div class="card sa-card">
            <div class="card-head">
              <span class="card-title">Modules</span>
              <span class="text-muted" style="font-size: 12.5px">{{ detail.course.code }} · {{ detail.course.credits }} ECTS · {{ detail.course.term }}</span>
            </div>
            @for (m of detail.modules; track m.id) {
              <div class="module">
                <div class="module-head"><span class="text-muted">{{ m.weekLabel }}</span> {{ m.title }}</div>
                @for (i of m.items; track i.id) {
                  <div class="item">
                    <span class="item-icon" [style.color]="detail.course.colorHex"><sb-icon [name]="icon(i.type)" [size]="14"></sb-icon></span>
                    <span class="item-title">{{ i.title }}</span>
                    @if (i.dueAt) {
                      <span class="text-muted item-meta">Due {{ i.dueAt | date: 'MMM d, HH:mm' }}</span>
                    }
                    @if (i.points !== null) {
                      <span class="text-muted item-meta">{{ i.points }} pts</span>
                    }
                  </div>
                } @empty {
                  <div class="text-muted item">No items yet.</div>
                }
              </div>
            } @empty {
              <p class="text-muted">No modules have been published for this course yet.</p>
            }
          </div>
        </div>

        <div>
          <div class="card sa-card">
            <div class="card-head"><span class="card-title">Attendance</span></div>
            <div class="att">
              <div><span class="n">{{ detail.attendance.presences }}</span><span class="l">Present</span></div>
              <div><span class="n">{{ detail.attendance.lates }}</span><span class="l">Late</span></div>
              <div><span class="n">{{ detail.attendance.authorizedAbsences }}</span><span class="l">Authorised absence</span></div>
              <div><span class="n">{{ detail.attendance.unauthorizedAbsences }}</span><span class="l">Unauthorised absence</span></div>
            </div>
          </div>
          <div class="card sa-card">
            <div class="card-head"><span class="card-title">Instructors</span></div>
            @for (p of detail.instructors; track p.id) {
              <div class="person">
                <span class="avatar">{{ p.avatarInitials }}</span>
                <span>
                  <div>{{ p.fullName }}</div>
                  <div class="text-muted" style="font-size: 12px">{{ p.title }} · <a [href]="'mailto:' + p.email">{{ p.email }}</a></div>
                </span>
              </div>
            } @empty {
              <p class="text-muted">To be announced.</p>
            }
          </div>
          @if (description) {
            <div class="card sa-card">
              <div class="card-head"><span class="card-title">About</span></div>
              <p class="text-secondary" style="font-size: 13px; white-space: pre-line">{{ description }}</p>
            </div>
          }
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
      }
      .module {
        padding: 10px 0 14px;
        border-bottom: 1px solid var(--border);
      }
      .module:last-child {
        border-bottom: none;
      }
      .module-head {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 8px;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 0;
        font-size: 13px;
      }
      .item-title {
        flex: 1;
      }
      .item-meta {
        font-size: 12px;
      }
      .item-icon {
        display: flex;
      }
      .att {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .att .n {
        display: block;
        font-size: 22px;
        font-weight: 500;
      }
      .att .l {
        font-size: 12px;
        color: var(--text-muted);
      }
      .person {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 6px 0;
        font-size: 13px;
      }
      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--surface-sunken);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
      }
      @media (max-width: 1000px) {
        .layout {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class CourseDetailComponent implements OnInit {
  private api = inject(StudentApiService);
  private route = inject(ActivatedRoute);

  detail: CourseDetail | null = null;
  description: string | null = null;
  error: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({ detail: this.api.course(id), catalog: this.api.catalog() }).subscribe({
      next: ({ detail, catalog }) => {
        this.detail = detail;
        this.description = catalog.find((c) => c.code === detail.course.code)?.description ?? null;
      },
      error: (err) => (this.error = studentApiError(err, 'Could not load this course.')),
    });
  }

  icon(type: string): string {
    return ITEM_ICON[type] ?? 'file-text';
  }
}
