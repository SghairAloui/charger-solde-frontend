import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {User} from '../models/user.model';

@Injectable({providedIn: 'root'})
export class TokenService {
  private readonly tokenKey = environment.tokenKey;
  private readonly userKey = environment.userKey;

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private readonly backendUrl = environment.apiUrl.replace('/api', '');

  getUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    const user: User = JSON.parse(raw);
    if (user.photoUrl && !user.photoUrl.startsWith('http')) {
      user.photoUrl = this.backendUrl + user.photoUrl;
    }
    return user;
  }

  setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  removeUser(): void {
    localStorage.removeItem(this.userKey);
  }

  clear(): void {
    this.removeToken();
    this.removeUser();
  }

  hasToken(): boolean {
    return !!this.getToken();
  }
}
