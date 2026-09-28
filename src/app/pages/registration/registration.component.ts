import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { StudentApiService, studentApiError } from '../../core/student-api.service';
import { CatalogCourse, CourseSummary, EnrollmentRequest } from '../../core/student-api.models';

/** Browse the course catalogue and ask to be enrolled; the programme office approves. */
@Component({
  selector: 'sb-registration',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-header">
      <h1>Registration</h1>
    </div>

    @if (error) {
      <div class="sa-error" style="margin-bottom: 16px">{{ error }}</div>
    }

    <div class="card sa-card">
      <div class="card-head"><span class="card-title">Course catalogue</span></div>
      @if (catalog.length === 0) {
        <p class="text-muted">The catalogue is empty.</p>
      } @else {
        <table>
          <thead><tr><th>Code</th><th>Course</th><th>Credits</th><th>Term</th><th></th></tr></thead>
          <tbody>
            @for (c of catalog; track c.id) {
              <tr>
                <td class="text-muted">{{ c.code }}</td>
                <td>
                  <div>{{ c.title }}</div>
                  @if (c.description) {
                    <div class="text-muted" style="font-size: 12px">{{ c.description }}</div>
                  }
                </td>
                <td class="text-muted">{{ c.credits }}</td>
                <td class="text-muted">{{ c.term }}</td>
                <td style="text-align: right">
                  @switch (stateOf(c)) {
                    @case ('enrolled') { <span class="badge badge-success">Enrolled</span> }
                    @case ('pending') { <span class="badge badge-warning">Requested</span> }
                    @default { <button class="btn-soft" (click)="request(c)" [disabled]="busy === c.id">Request</button> }
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>

    <div class="card sa-card">
      <div class="card-head"><span class="card-title">My requests</span></div>
      @if (requests.length === 0) {
        <p class="text-muted">You haven't requested any courses.</p>
      } @else {
        <table>
          <thead><tr><th>Course</th><th>Requested</th><th>Status</th></tr></thead>
          <tbody>
            @for (r of requests; track r.id) {
              <tr>
                <td>{{ r.courseCode }} — {{ r.courseTitle }}</td>
                <td class="text-muted">{{ r.requestedAt | date: 'MMM d, y' }}</td>
                <td>
                  <span class="badge" [class.badge-warning]="r.status === 'PENDING'" [class.badge-success]="r.status === 'APPROVED'" [class.badge-danger]="r.status === 'REJECTED'">{{ r.status }}</span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
})
export class RegistrationComponent implements OnInit {
  private api = inject(StudentApiService);

  catalog: CatalogCourse[] = [];
  requests: EnrollmentRequest[] = [];
  enrolledCodes = new Set<string>();
  busy: number | null = null;
  error: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin({ catalog: this.api.catalog(), requests: this.api.myRequests(), courses: this.api.courses() }).subscribe({
      next: ({ catalog, requests, courses }) => {
        this.catalog = catalog;
        this.requests = requests;
        this.enrolledCodes = new Set(courses.map((c: CourseSummary) => c.code));
      },
      error: (err) => (this.error = studentApiError(err, 'Could not load the catalogue.')),
    });
  }

  stateOf(c: CatalogCourse): 'enrolled' | 'pending' | 'open' {
    if (this.enrolledCodes.has(c.code)) return 'enrolled';
    if (this.requests.some((r) => r.catalogCourseId === c.id && r.status === 'PENDING')) return 'pending';
    return 'open';
  }

  request(c: CatalogCourse): void {
    this.busy = c.id;
    this.error = null;
    this.api.requestEnrollment(c.id).subscribe({
      next: () => {
        this.busy = null;
        this.load();
      },
      error: (err) => {
        this.busy = null;
        this.error = studentApiError(err, 'Could not send the request.');
      },
    });
  }
}
