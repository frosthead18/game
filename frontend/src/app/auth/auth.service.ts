import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  username: string;
  email: string;
}

interface TokenResponse {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

const STORAGE_KEYS = {
  accessToken: 'auth_access_token',
  refreshToken: 'auth_refresh_token',
  expiresAt: 'auth_expires_at',
  user: 'auth_user',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private readonly currentUser$ = new BehaviorSubject<AuthUser | null>(this.loadUser());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

  get user$(): Observable<AuthUser | null> {
    return this.currentUser$.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.currentUser$.getValue() !== null;
  }

  async signUp(username: string, email: string, password: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.api}/auth/signup`, { username, email, password }),
    );
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.api}/auth/confirm`, { email, code }),
    );
  }

  async signIn(email: string, password: string): Promise<void> {
    const tokens = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.api}/auth/signin`, { email, password }),
    );
    this.storeTokens(tokens, email);
  }

  async signOut(): Promise<void> {
    try {
      const token = this.getRawAccessToken();
      if (token) {
        await firstValueFrom(
          this.http.post(`${this.api}/auth/signout`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        );
      }
    } catch {
      // ignore signout errors — clear local state regardless
    }
    this.clearTokens();
    void this.router.navigate(['/auth/login']);
  }

  async forgotPassword(email: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.api}/auth/forgot-password`, { email }),
    );
  }

  async confirmNewPassword(email: string, code: string, newPassword: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.api}/auth/reset-password`, { email, code, newPassword }),
    );
  }

  getAccessToken(): Promise<string | null> {
    const token = this.getRawAccessToken();
    if (!token) return Promise.resolve(null);

    const expiresAt = Number(localStorage.getItem(STORAGE_KEYS.expiresAt) ?? 0);
    if (Date.now() < expiresAt) return Promise.resolve(token);

    return this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }

    try {
      const tokens = await firstValueFrom(
        this.http.post<TokenResponse>(`${this.api}/auth/refresh`, { refreshToken }),
      );
      this.storeTokens(tokens);
      return tokens.accessToken;
    } catch {
      this.clearTokens();
      return null;
    }
  }

  private storeTokens(tokens: TokenResponse, email?: string): void {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    if (tokens.refreshToken) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    }
    const expiresIn = tokens.expiresIn ?? 3600;
    localStorage.setItem(STORAGE_KEYS.expiresAt, String(Date.now() + expiresIn * 1000 - 30_000));

    if (email) {
      const user: AuthUser = { username: email, email };
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
      this.currentUser$.next(user);
    }
  }

  private clearTokens(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    this.currentUser$.next(null);
  }

  private getRawAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.user);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
