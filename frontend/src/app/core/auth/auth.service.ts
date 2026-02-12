import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { LoginInput, LoginResponse, RegisterInput, RegisterResponse } from '@shared/schemas/auth.schema';
import { firstValueFrom } from 'rxjs';

interface UserInfo {
  id: string;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _currentUser = signal<UserInfo | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private _accessToken: string | null = null;

  readonly currentUser = this._currentUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  get accessToken(): string | null {
    return this._accessToken;
  }

  async register(dto: RegisterInput): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<{ data: RegisterResponse }>('/api/v1/auth/register', dto, {
          withCredentials: true,
        }),
      );

      this._accessToken = response.data.accessToken;
      this._currentUser.set(response.data.user);
      await this.router.navigate(['/']);
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err);
      this._error.set(message);
    } finally {
      this._loading.set(false);
    }
  }

  async login(dto: LoginInput): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<{ data: LoginResponse }>('/api/v1/auth/login', dto, {
          withCredentials: true,
        }),
      );

      this._accessToken = response.data.accessToken;
      this._currentUser.set(response.data.user);
      await this.router.navigate(['/']);
    } catch (err: unknown) {
      const message = this.extractErrorMessage(err);
      this._error.set(message);
    } finally {
      this._loading.set(false);
    }
  }

  async refresh(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ data: LoginResponse }>('/api/v1/auth/refresh', {}, {
          withCredentials: true,
        }),
      );

      this._accessToken = response.data.accessToken;
      this._currentUser.set(response.data.user);
      return true;
    } catch {
      this._accessToken = null;
      this._currentUser.set(null);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.post('/api/v1/auth/logout', {}, {
          withCredentials: true,
        }),
      );
    } catch {
      // Ignore logout errors — clear local state regardless
    } finally {
      this._accessToken = null;
      this._currentUser.set(null);
      await this.router.navigate(['/login']);
    }
  }

  async tryRestoreSession(): Promise<void> {
    try {
      await this.refresh();
    } catch {
      // Silent failure — user will see login page
    }
  }

  private extractErrorMessage(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const httpErr = err as { error?: { message?: string } };
      if (httpErr.error?.message) {
        return httpErr.error.message;
      }
    }
    if (err && typeof err === 'object' && 'message' in err) {
      return (err as { message: string }).message;
    }
    return 'Une erreur est survenue';
  }
}
