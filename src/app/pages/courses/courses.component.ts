import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { CourseSummary } from '../../core/student-api.models';
import { ArtTileComponent, ArtVariant } from '../../shared/art-tile.component';

const ART: ArtVariant[] = ['sea', 'dusk', 'hills', 'dunes', 'reef'];

/** The signed-in student's enrolled courses. */
@Component({
  selector: 'sb-courses',
  standalone: true,
  imports: [RouterLink, ArtTileComponent],
  template: `
    <div class="page-header">
      <h1>My Courses</h1>
      <a routerLink="/student-portal/registration" class="btn-soft">Request a course</a>
    </div>

    @if (error) {
      <div class="card sa-card text-secondary">{{ error }}</div>
    } @else if (courses === null) {
      <div class="card sa-card text-muted">Loading…</div>
    } @else if (courses.length === 0) {
      <div class="card sa-card text-muted">
        You aren't enrolled in any courses yet. Your programme administrator will enroll you, or you can request a course from Registration.
      </div>
    } @else {
      <div class="course-grid">
        @for (c of courses; track c.id; let i = $index) {
          <a class="card course-card" [routerLink]="['/student-portal/courses', c.id]">
            <sb-art class="art" [variant]="art(i)" [seed]="c.id * 7" [shade]="true"></sb-art>
            <div class="body">
              <span class="code" [style.color]="c.colorHex">{{ c.code }}</span>
              <span class="title">{{ c.title }}</span>
              <span class="meta">{{ c.instructorNames.join(', ') || 'Instructor to be announced' }}</span>
              <span class="meta">{{ c.credits }} ECTS · {{ c.term }}</span>
            </div>
          </a>
        }
      </div>
    }
  `,
  styles: [
    `
      .course-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 18px;
      }
      .course-card {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        transition: transform 0.15s ease;
      }
      .course-card:hover {
        transform: translateY(-2px);
      }
      .art {
        display: block;
        height: 110px;
      }
      .body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .code {
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.03em;
      }
      .title {
        font-size: 15px;
        font-weight: 600;
      }
      .meta {
        font-size: 12px;
        color: var(--text-muted);
      }
    `,
  ],
})
export class CoursesComponent implements OnInit {
  private api = inject(StudentApiService);
  courses: CourseSummary[] | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.api.courses().subscribe({
      next: (r) => (this.courses = r),
      error: (err) => (this.error = studentApiError(err, 'Could not load your courses.')),
    });
  }

  art(i: number): ArtVariant {
    return ART[i % ART.length];
  }
}
