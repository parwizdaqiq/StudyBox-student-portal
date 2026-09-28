import { Routes } from '@angular/router';
import { studentGuard } from '../core/student.guard';
import { AppShellComponent } from '../shell/app-shell.component';
import { AnnouncementsComponent } from '../pages/announcements/announcements.component';
import { AssignmentsComponent } from '../pages/assignments/assignments.component';
import { AttendanceComponent } from '../pages/attendance/attendance.component';
import { CalendarComponent } from '../pages/calendar/calendar.component';
import { ClassmatesComponent } from '../pages/classmates/classmates.component';
import { CourseDetailComponent } from '../pages/course-detail/course-detail.component';
import { CoursesComponent } from '../pages/courses/courses.component';
import { DashboardComponent } from '../pages/dashboard/dashboard.component';
import { DiscussionsComponent } from '../pages/discussions/discussions.component';
import { FinancialComponent } from '../pages/financial/financial.component';
import { GradesComponent } from '../pages/grades/grades.component';
import { StudentLoginComponent } from '../pages/login/student-login.component';
import { RegistrationComponent } from '../pages/registration/registration.component';
import { ReportsComponent } from '../pages/reports/reports.component';
import { TimetablePageComponent } from '../pages/timetable/timetable-page.component';

export const studentPortalRoutes: Routes = [
  { path: 'login', component: StudentLoginComponent, title: 'Sign in · Student Portal' },
  {
    path: '', component: AppShellComponent, canActivate: [studentGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard · Student Portal' },
      { path: 'courses', component: CoursesComponent, title: 'Courses · Student Portal' },
      { path: 'courses/:id', component: CourseDetailComponent, title: 'Course · Student Portal' },
      { path: 'assignments', component: AssignmentsComponent, title: 'Assignments · Student Portal' },
      { path: 'timetable', component: TimetablePageComponent, title: 'Timetable · Student Portal' },
      { path: 'grades', component: GradesComponent, title: 'Grades · Student Portal' },
      { path: 'attendance', component: AttendanceComponent, title: 'Attendance · Student Portal' },
      { path: 'discussions', component: DiscussionsComponent, title: 'Discussions · Student Portal' },
      { path: 'classmates', component: ClassmatesComponent, title: 'Classmates · Student Portal' },
      { path: 'financial', component: FinancialComponent, title: 'Financial · Student Portal' },
      { path: 'registration', component: RegistrationComponent, title: 'Registration · Student Portal' },
      { path: 'announcements', component: AnnouncementsComponent, title: 'Announcements · Student Portal' },
      { path: 'calendar', component: CalendarComponent, title: 'Calendar · Student Portal' },
      { path: 'reports', component: ReportsComponent, title: 'Reports · Student Portal' },
    ],
  },
];
