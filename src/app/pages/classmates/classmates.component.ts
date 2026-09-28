import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { Classmate, CourseSummary, Instructor } from '../../core/student-api.models';

/** Who else is in the student's courses, plus the instructors who teach them. */
@Component({
  selector: 'sb-classmates',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-header">
      <h1>Classmates &amp; Educators</h1>
      <select class="sa-input" style="max-width: 280px" [(ngModel)]="courseId" (ngModelChange)="loadClassmates()">
        <option [ngValue]="null">All my courses</option>
        @for (c of courses; track c.id) {
          <option [ngValue]="c.id">{{ c.code }} — {{ c.title }}</option>
        }
      </select>
    </div>

    @if (error) {
      <div class="card sa-card text-secondary">{{ error }}</div>
    }

    <div class="card sa-card">
      <div class="card-head"><span class="card-title">Classmates ({{ uniqueClassmates().length }})</span></div>
      @if (uniqueClassmates().length === 0) {
        <p class="text-muted">No classmates yet.</p>
      } @else {
        <div class="people">
          @for (p of uniqueClassmates(); track p.id) {
            <div class="person">
              <span class="avatar">{{ p.initials }}</span>
              <span>
                <div class="name">{{ p.fullName }}</div>
                <div class="meta">{{ coursesOf(p.id) }}</div>
              </span>
            </div>
          }
        </div>
      }
    </div>

    <div class="card sa-card">
      <div class="card-head"><span class="card-title">My educators</span></div>
      @if (educators.length === 0) {
        <p class="text-muted">No instructors assigned yet.</p>
      } @else {
        <div class="people">
          @for (e of educators; track e.id) {
            <div class="person">
              <span class="avatar dark">{{ e.avatarInitials }}</span>
              <span>
                <div class="name">{{ e.fullName }}</div>
                <div class="meta">{{ e.title }} · <a [href]="'mailto:' + e.email">{{ e.email }}</a></div>
                <div class="meta">{{ e.courses.join(', ') }}</div>
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .people {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 14px;
      }
      .person {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--surface-sunken);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12.5px;
        font-weight: 600;
        flex-shrink: 0;
      }
      .avatar.dark {
        background: var(--ink);
        color: #fff;
      }
      .name {
        font-size: 13.5px;
        font-weight: 500;
      }
      .meta {
        font-size: 12px;
        color: var(--text-muted);
      }
    `,
  ],
})
export class ClassmatesComponent implements OnInit {
  private api = inject(StudentApiService);

  courses: CourseSummary[] = [];
  classmates: Classmate[] = [];
  educators: Instructor[] = [];
  courseId: number | null = null;
  error: string | null = null;

  ngOnInit(): void {
    forkJoin({ courses: this.api.courses(), educators: this.api.educators() }).subscribe({
      next: ({ courses, educators }) => {
        this.courses = courses;
        const mine = new Set(courses.map((c) => c.title));
        this.educators = educators.filter((e) => e.courses.some((t) => mine.has(t)));
      },
      error: (err) => (this.error = studentApiError(err, 'Could not load the directory.')),
    });
    this.loadClassmates();
  }

  loadClassmates(): void {
    this.api.classmates(this.courseId).subscribe({ next: (r) => (this.classmates = r) });
  }

  uniqueClassmates(): Classmate[] {
    const seen = new Map<number, Classmate>();
    for (const c of this.classmates) if (!seen.has(c.id)) seen.set(c.id, c);
    return [...seen.values()].sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  coursesOf(id: number): string {
    return [...new Set(this.classmates.filter((c) => c.id === id).map((c) => c.courseTitle))].join(', ');
  }
}
