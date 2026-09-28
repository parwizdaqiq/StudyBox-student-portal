import { Routes } from '@angular/router';
import { studentPortalRoutes } from './student-portal/student-portal.routes';

/** Standalone student application. Staff management routes live in ../admin. */
export const routes: Routes = [
  ...studentPortalRoutes,
  // Compatibility for links saved before the applications were physically split.
  { path: 'student-portal', children: studentPortalRoutes },
  { path: '**', redirectTo: '' },
];
