import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StudentAuthService } from './student-auth.service';
import { PORTAL_PATHS } from './portal-config';

/** Keeps the student portal behind a real student login. */
export const studentGuard: CanActivateFn = (_route, state) => {
  const auth = inject(StudentAuthService);
  if (auth.isLoggedIn) {
    return true;
  }
  return inject(Router).createUrlTree([PORTAL_PATHS.student.login], { queryParams: { next: state.url } });
};
