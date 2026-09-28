import { Component, OnInit, inject } from '@angular/core';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { GradeCourse } from '../../core/student-api.models';

/** Weighted grade breakdown per course, exactly as published by the programme office. */
@Component({
  selector: 'sb-grades',
  standalone: true,
  template: `
    <div class="page-header">
      <h1>Grades</h1>
    </div>

    @if (error) {
      <div class="card sa-card text-secondary">{{ error }}</div>
    } @else if (grades === null) {
      <div class="card sa-card text-muted">Loading…</div>
    } @else if (grades.length === 0) {
      <div class="card sa-card text-muted">No grades have been published for you yet.</div>
    } @else {
      @for (g of grades; track g.courseId) {
        <div class="card sa-card">
          <div class="card-head">
            <span class="card-title"><span class="sa-dot" [style.background]="g.colorHex"></span>{{ g.courseCode }} · {{ g.courseTitle }}</span>
            <span class="total" [style.background]="g.colorHex + '1f'" [style.color]="g.colorHex">
              {{ g.totalPercent !== null ? g.totalPercent + '%' : 'Not graded yet' }}
            </span>
          </div>
          <table>
            <thead>
              <tr><th>Category</th><th>Weight</th><th>Item</th><th>Score</th><th>Category %</th></tr>
            </thead>
            <tbody>
              @for (cat of g.categories; track cat.name) {
                @for (item of cat.items; track item.id; let first = $first) {
                  <tr>
                    <td>{{ first ? cat.name : '' }}</td>
                    <td class="text-muted">{{ first ? cat.weightPercent + '%' : '' }}</td>
                    <td>{{ item.name }}</td>
                    <td>
                      @if (item.posted && item.scoreEarned !== null) {
                        {{ item.scoreEarned }} / {{ item.maxScore }}
                      } @else {
                        <span class="text-muted">Not posted yet</span>
                      }
                    </td>
                    <td class="text-muted">{{ first && cat.categoryPercent !== null ? cat.categoryPercent + '%' : '' }}</td>
                  </tr>
                } @empty {
                  <tr>
                    <td>{{ cat.name }}</td>
                    <td class="text-muted">{{ cat.weightPercent }}%</td>
                    <td class="text-muted" colspan="3">Nothing posted yet</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      }
    }
  `,
  styles: [
    `
      .total {
        font-size: 13px;
        font-weight: 600;
        padding: 5px 12px;
        border-radius: 20px;
      }
    `,
  ],
})
export class GradesComponent implements OnInit {
  private api = inject(StudentApiService);
  grades: GradeCourse[] | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.api.grades().subscribe({
      next: (r) => (this.grades = r),
      error: (err) => (this.error = studentApiError(err, 'Could not load your grades.')),
    });
  }
}
