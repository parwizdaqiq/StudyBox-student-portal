import { signal } from '@angular/core';

/** Framework-native state shared by the two independent authentication services. */
export class AuthSessionState<TProfile> {
  private readonly tokenSignal = signal<string | null>(null);
  private readonly profileSignal = signal<TProfile | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly tokenState = this.tokenSignal.asReadonly();
  readonly profileState = this.profileSignal.asReadonly();
  readonly loadingState = this.loadingSignal.asReadonly();
  readonly errorState = this.errorSignal.asReadonly();

  get token(): string | null { return this.tokenSignal(); }
  get profile(): TProfile | null { return this.profileSignal(); }
  get loading(): boolean { return this.loadingSignal(); }
  get error(): string | null { return this.errorSignal(); }
  get isLoggedIn(): boolean { return !!this.tokenSignal(); }

  hydrate(token: string | null, profile: TProfile | null): void {
    this.tokenSignal.set(token);
    this.profileSignal.set(profile);
  }

  beginRequest(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
  }

  setSession(token: string, profile: TProfile): void {
    this.tokenSignal.set(token);
    this.profileSignal.set(profile);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }

  setProfile(profile: TProfile): void { this.profileSignal.set(profile); }

  fail(message: string): void {
    this.loadingSignal.set(false);
    this.errorSignal.set(message);
  }

  clear(): void {
    this.tokenSignal.set(null);
    this.profileSignal.set(null);
    this.loadingSignal.set(false);
    this.errorSignal.set(null);
  }
}
