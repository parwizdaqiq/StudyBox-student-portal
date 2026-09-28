import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentAuthService } from '../../core/student-auth.service';
import { IconComponent } from '../../shared/icon.component';

/**
 * Student sign-in for the web portal — same account (email + password) the Admin
 * created for them, and the same one they use in the mobile app.
 */
@Component({
  selector: 'sb-student-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  template: `
    <div class="wrap">
      <form class="card" (ngSubmit)="submit()">
        <div class="badge-row">
          <span class="shield"><sb-icon name="logo" [size]="22"></sb-icon></span>
          <div>
            <div class="eyebrow">StudyBox</div>
            <h1>Student Portal</h1>
          </div>
        </div>
        <p class="lede">
          Sign in with the email and password your programme administrator gave you — the same
          login you use in the StudyBox mobile app.
        </p>

        <label class="field">
          <span>Email</span>
          <input type="email" [(ngModel)]="email" name="email" placeholder="you@studybox.app" required autocomplete="username" />
        </label>
        <label class="field">
          <span>Password</span>
          <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required autocomplete="current-password" />
        </label>

        @if (auth.error) {
          <div class="error">{{ auth.error }}</div>
        }

        <button class="btn-primary submit" type="submit" [disabled]="auth.loading">
          {{ auth.loading ? 'Signing in…' : 'Sign in' }}
        </button>

        <a href="http://localhost:4200/login" class="back">Staff? Open Admin →</a>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: var(--page-bg, #e6e6e9);
      }
      .wrap {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .card {
        width: 100%;
        max-width: 400px;
        background: var(--surface, #f6f6f8);
        border-radius: 24px;
        box-shadow: var(--shadow-card, 0 18px 40px -24px rgba(20, 20, 40, 0.18));
        padding: 32px 30px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .badge-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 2px;
      }
      .shield {
        width: 42px;
        height: 42px;
        border-radius: 13px;
        background: var(--ink, #111114);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .eyebrow {
        font-size: 11.5px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-muted, #9a9aa3);
      }
      h1 {
        font-size: 20px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--text-primary, #16161a);
      }
      .lede {
        font-size: 12.5px;
        line-height: 1.55;
        color: var(--text-secondary, #5f5f67);
        margin: 0 0 6px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--text-secondary, #5f5f67);
      }
      .field input {
        font-family: inherit;
        font-size: 14px;
        font-weight: 400;
        color: var(--text-primary, #16161a);
        background: var(--surface-sunken, #e4e4e8);
        border: none;
        border-radius: 12px;
        padding: 11px 13px;
        outline: none;
      }
      .field input:focus {
        outline: 2px solid var(--primary, #1f2bd8);
        outline-offset: -1px;
      }
      .error {
        background: rgba(224, 72, 72, 0.1);
        color: var(--danger, #e04848);
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 12.5px;
        line-height: 1.4;
      }
      .submit {
        margin-top: 4px;
        padding: 12px;
        border-radius: 13px;
        font-size: 13.5px;
      }
      .hint {
        text-align: center;
        font-size: 11.5px;
        color: var(--text-muted, #9a9aa3);
      }
      .hint code {
        background: var(--surface-sunken, #e4e4e8);
        border-radius: 5px;
        padding: 1px 5px;
      }
      .back {
        text-align: center;
        font-size: 12.5px;
        color: var(--text-secondary, #5f5f67);
        margin-top: 4px;
      }
      .back:hover {
        color: var(--text-primary, #16161a);
      }
    `,
  ],
})
export class StudentLoginComponent {
  auth = inject(StudentAuthService);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';

  submit(): void {
    if (!this.email || !this.password) return;
    const next = this.route.snapshot.queryParamMap.get('next');
    this.auth.login(
      this.email.trim(),
      this.password,
      next?.startsWith('/student-portal/') ? next : '/student-portal/dashboard',
    );
  }
}
