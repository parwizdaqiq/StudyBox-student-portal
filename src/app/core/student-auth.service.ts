import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { API_BASE_URL } from './api-config';
import { StudentProfile } from './student-api.models';
import { AuthSessionState } from './auth-session.state';
import { PORTAL_PATHS } from './portal-config';

const TOKEN_KEY = 'sb_student_token';
const PROFILE_KEY = 'sb_student_profile';

/**
 * Signs a student into the real backend (`/api/auth/login`) with the account an Admin
 * created for them. The token is kept in `localStorage` so a refresh doesn't sign them out;
 * any 401 from the API clears it again (see `student-api.service.ts`).
 */
@Injectable({ providedIn: 'root' })
export class StudentAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly state = new AuthSessionState<StudentProfile>();

  constructor() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const raw = localStorage.getItem(PROFILE_KEY);
      this.state.hydrate(token, raw ? JSON.parse(raw) : null);
    } catch {
      // Storage unavailable — start signed out.
    }
  }

  get token(): string | null {
    return this.state.token;
  }

  get profile(): StudentProfile | null {
    return this.state.profile;
  }

  get isLoggedIn(): boolean {
    return this.state.isLoggedIn;
  }

  get loading(): boolean { return this.state.loading; }
  get error(): string | null { return this.state.error; }

  get authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  setProfile(profile: StudentProfile): void {
    this.state.setProfile(profile);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  login(email: string, password: string, redirectTo: string = PORTAL_PATHS.student.home): void {
    this.state.beginRequest();
    this.http
      .post<{ token: string; student: StudentProfile }>(`${API_BASE_URL}/api/auth/login`, { email, password })
      .subscribe({
        next: (res) => {
          this.state.setSession(res.token, res.student);
          try {
            localStorage.setItem(TOKEN_KEY, res.token);
            localStorage.setItem(PROFILE_KEY, JSON.stringify(res.student));
          } catch {
            // Non-fatal — the session just won't survive a refresh.
          }
          this.router.navigateByUrl(redirectTo);
        },
        error: (err) => {
          this.state.fail(
            err?.status === 0
              ? `Could not reach the StudyBox backend at ${API_BASE_URL}. Is it running?`
              : err?.status === 401 || err?.status === 400 || err?.status === 403
                ? 'Wrong email or password.'
                : (err?.error?.message ?? 'Sign-in failed.'),
          );
        },
      });
  }

  logout(): void {
    this.state.clear();
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
    } catch {
      // ignore
    }
    this.router.navigateByUrl(PORTAL_PATHS.student.login);
  }
}
