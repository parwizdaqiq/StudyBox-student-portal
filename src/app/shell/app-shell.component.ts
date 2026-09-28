import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../shared/icon.component';
import { StudentAuthService } from '../core/student-auth.service';
import { initials } from '../core/student-mappers';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

/**
 * App frame matching the reference: the whole app sits inside one large,
 * softly shadowed rounded panel. Top row = logo, a borderless search, and
 * "All Courses | Schedule Session" + bell on the right. Left column = a light
 * sidebar where every entry shows its icon AND its name; the active entry is
 * a solid black rounded tile. The signed-in student's card sits at the bottom.
 * Every page inside reads the live backend for the signed-in student.
 */
@Component({
  selector: 'sb-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <div class="frame">
      <a class="logo" routerLink="/student-portal/dashboard" aria-label="Student Portal home">
        <sb-icon name="logo" [size]="30"></sb-icon>
        <span class="logo-text"><small>StudyBox</small>Student Portal</span>
      </a>

      <header class="topbar">
        <div class="hello">
          <span class="hello-name">Hi, {{ firstName }}</span>
          <span class="hello-sub">{{ auth.profile?.programme }}</span>
        </div>

        <nav class="top-links">
          <a routerLink="/student-portal/courses" class="top-link">
            <sb-icon name="briefcase" [size]="16"></sb-icon>
            <span>My Courses</span>
          </a>
          <span class="top-sep"></span>
          <a routerLink="/student-portal/timetable" class="top-link">
            <sb-icon name="calendar-fill" [size]="16"></sb-icon>
            <span>Timetable</span>
          </a>
          <span class="top-sep"></span>
          <a href="http://localhost:4200" class="top-link super-admin-link">
            <sb-icon name="shield" [size]="16"></sb-icon>
            <span>Admin</span>
          </a>
          <a routerLink="/student-portal/announcements" class="bell" aria-label="Announcements">
            <sb-icon name="bell-fill" [size]="18"></sb-icon>
          </a>
        </nav>
      </header>

      <aside class="sidebar">
        <nav class="nav">
          @for (item of primaryNav; track item.path) {
            <a class="nav-item" [routerLink]="item.path" routerLinkActive="active">
              <span class="nav-icon"><sb-icon [name]="item.icon" [size]="16"></sb-icon></span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }

          <span class="nav-divider"></span>

          @for (item of secondaryNav; track item.path) {
            <a class="nav-item" [routerLink]="item.path" routerLinkActive="active">
              <span class="nav-icon"><sb-icon [name]="item.icon" [size]="16"></sb-icon></span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="me">
          <span class="me-avatar">{{ myInitials }}</span>
          <span class="me-text">
            <span class="me-name">{{ auth.profile?.fullName }}</span>
            <span class="me-id">{{ auth.profile?.studentNumber }}</span>
          </span>
          <button class="me-out" (click)="auth.logout()" title="Sign out" aria-label="Sign out">
            <sb-icon name="log-out" [size]="15"></sb-icon>
          </button>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 16px;
        min-height: 100vh;
      }
      .frame {
        display: grid;
        grid-template-columns: 184px minmax(0, 1fr);
        grid-template-rows: 68px 1fr;
        min-height: calc(100vh - 32px);
        background: var(--bg);
        border-radius: 34px;
        box-shadow: var(--shadow-frame);
      }

      /* ---------------------------------------------------------- top row */
      .logo {
        grid-column: 1;
        grid-row: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        padding-left: 26px;
        color: var(--ink);
      }
      .logo-text {
        display: flex;
        flex-direction: column;
        font-size: 15px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }
      .logo-text small {
        color: var(--text-muted);
        font-size: 9px;
        font-weight: 600;
        letter-spacing: .08em;
        line-height: 1;
        text-transform: uppercase;
      }
      .topbar {
        grid-column: 2;
        grid-row: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: 0 30px 0 8px;
      }
      .search {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text-secondary);
        flex: 1;
        max-width: 420px;
      }
      .search input {
        border: none;
        background: transparent;
        outline: none;
        font-family: inherit;
        font-size: 13px;
        color: var(--text-primary);
        width: 100%;
      }
      .search input::placeholder {
        color: var(--text-secondary);
      }
      .top-links {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .top-link {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text-primary);
      }
      .top-link sb-icon {
        color: var(--icon);
      }
      .top-link:hover sb-icon {
        color: var(--text-primary);
      }
      .super-admin-link {
        color: var(--primary);
      }
      .super-admin-link sb-icon {
        color: var(--primary);
      }
      .top-sep {
        width: 1px;
        height: 24px;
        background: var(--border);
      }
      .bell {
        position: relative;
        margin-left: 12px;
        color: var(--icon);
        display: flex;
      }
      .bell:hover {
        color: var(--text-primary);
      }
      .bell-dot {
        position: absolute;
        top: 0;
        right: 0;
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--icon);
        border: 1.5px solid var(--bg);
      }

      /* ---------------------------------------------------------- sidebar */
      .sidebar {
        grid-column: 1;
        grid-row: 2;
        display: flex;
        flex-direction: column;
        padding: 20px 12px 20px 16px;
      }
      .nav {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 4px 10px 4px 5px;
        border-radius: 13px;
        color: var(--text-secondary);
        font-size: 12.5px;
        font-weight: 500;
        transition: background 0.15s ease;
      }
      .nav-icon {
        width: 30px;
        height: 30px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--icon);
        flex-shrink: 0;
      }
      .nav-item:hover {
        background: var(--surface-sunken);
        color: var(--text-primary);
      }
      .nav-item.active {
        background: var(--ink);
        color: #fff;
        box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.5);
      }
      .nav-item.active .nav-icon {
        color: #fff;
      }
      .nav-label {
        white-space: nowrap;
      }
      .nav-divider {
        height: 1px;
        background: var(--border);
        margin: 8px 12px;
      }

      .ai-wrap {
        position: relative;
        margin-top: 20px;
      }
      .ai-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        background: none;
        border: none;
        padding: 0;
        color: var(--text-secondary);
        font-size: 12.5px;
        font-weight: 500;
      }
      .ai-orb {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 15px;
        font-weight: 500;
        background: radial-gradient(circle at 50% 75%, #2f6bff 0%, #3b8cff 45%, #9fdcff 100%);
        box-shadow: 0 0 24px 6px rgba(80, 170, 255, 0.35), 0 12px 24px -8px rgba(40, 90, 255, 0.6);
        flex-shrink: 0;
      }
      .ai-panel {
        position: absolute;
        bottom: 58px;
        left: 0;
        width: 260px;
        background: var(--surface);
        border-radius: 20px;
        box-shadow: var(--shadow-card), 0 20px 40px -12px rgba(0, 0, 0, 0.18);
        padding: 16px 18px;
        z-index: 10;
      }
      .ai-panel-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .ai-line {
        font-size: 12.5px;
        color: var(--text-secondary);
        line-height: 1.45;
        padding: 6px 0;
        border-top: 1px solid var(--border);
      }

      /* ---------------------------------------------------------- content */
      .content {
        grid-column: 2;
        grid-row: 2;
        padding: 6px 30px 30px 8px;
        min-width: 0;
      }

      @media (max-width: 1100px) {
        :host {
          padding: 12px;
        }
        .frame {
          grid-template-columns: 172px minmax(0, 1fr);
          border-radius: 32px;
        }
        .logo {
          padding-left: 26px;
        }
        .sidebar {
          padding: 24px 12px 24px 16px;
        }
        .content {
          padding: 12px 20px 28px 8px;
        }
      }
      /* Only on genuinely narrow screens do the names give way to icons. */
      @media (max-width: 900px) {
        .frame {
          grid-template-columns: 68px minmax(0, 1fr);
        }
        .logo {
          padding-left: 22px;
        }
        .logo-text,
        .nav-label {
          display: none;
        }
        .sidebar {
          padding: 24px 12px;
          align-items: center;
        }
        .nav-item {
          padding: 7px;
        }
        .top-link span {
          display: none;
        }
      }

      /* ------------------------------------------------ greeting + me card */
      .hello {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .hello-name {
        font-size: 16px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      .hello-sub {
        font-size: 12px;
        color: var(--text-muted);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .me {
        margin-top: auto;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 10px;
        border-radius: 16px;
        background: var(--surface);
        box-shadow: var(--shadow-card);
      }
      .me-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--ink);
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .me-text {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
      }
      .me-name {
        font-size: 12.5px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .me-id {
        font-size: 11px;
        color: var(--text-muted);
      }
      .me-out {
        border: none;
        background: none;
        color: var(--text-muted);
        padding: 5px;
        border-radius: 8px;
        display: flex;
      }
      .me-out:hover {
        color: var(--danger);
        background: var(--surface-sunken);
      }
      @media (max-width: 900px) {
        .me {
          flex-direction: column;
          padding: 6px;
        }
        .me-text,
        .hello-sub {
          display: none;
        }
      }
    `,
  ],
})
export class AppShellComponent {
  auth = inject(StudentAuthService);

  primaryNav: NavItem[] = [
    { label: 'Dashboard', path: '/student-portal/dashboard', icon: 'dashboard' },
    { label: 'Courses', path: '/student-portal/courses', icon: 'courses' },
    { label: 'Timetable', path: '/student-portal/timetable', icon: 'calendar' },
    { label: 'Grades', path: '/student-portal/grades', icon: 'grades' },
    { label: 'Attendance', path: '/student-portal/attendance', icon: 'attendance' },
    { label: 'Discussions', path: '/student-portal/discussions', icon: 'message-circle' },
  ];

  secondaryNav: NavItem[] = [
    { label: 'Classmates', path: '/student-portal/classmates', icon: 'students' },
    { label: 'Financial', path: '/student-portal/financial', icon: 'wallet' },
    { label: 'Registration', path: '/student-portal/registration', icon: 'clipboard-check' },
    { label: 'Announcements', path: '/student-portal/announcements', icon: 'megaphone' },
    { label: 'Calendar', path: '/student-portal/calendar', icon: 'calendar-fill' },
    { label: 'Reports', path: '/student-portal/reports', icon: 'file-text' },
  ];

  get firstName(): string {
    return (this.auth.profile?.fullName ?? 'there').split(' ')[0];
  }

  get myInitials(): string {
    return initials(this.auth.profile?.fullName ?? '');
  }
}
