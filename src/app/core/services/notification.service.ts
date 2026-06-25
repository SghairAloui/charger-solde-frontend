import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {API} from '../constants/app.constants';

export interface AppNotification {
  id: number;
  type: 'RECHARGE' | 'MESSAGE' | 'CLAIM' | 'SYSTEM';
  title: string;
  message: string;
  data?: unknown;
  read: boolean;
  createdAt: string;
}

@Injectable({providedIn: 'root'})
export class NotificationService {
  private readonly base = `${environment.apiUrl}${API.NOTIFICATIONS.BASE}`;
  public readonly notifications$ = new BehaviorSubject<AppNotification[]>([]);
  public readonly unreadCount$ = new BehaviorSubject<number>(0);

  constructor(private readonly http: HttpClient) {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    // Backend doesn't have a REST API for notifications, relying on real-time WebSockets only.
    // We just initialize with empty array or keep current to avoid 404.
    if (this.notifications$.getValue().length === 0) {
      this.notifications$.next([]);
      this.updateUnreadCount([]);
    }
  }

  refresh(): void {
    // Do nothing, handled by websockets
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  markAsRead(id: number): void {
    const current = this.notifications$.getValue();
    const updated = current.map(n => n.id === id ? {...n, read: true} : n);
    this.notifications$.next(updated);
    this.updateUnreadCount(updated);
  }

  markAllAsRead(): void {
    const current = this.notifications$.getValue();
    const updated = current.map(n => ({...n, read: true}));
    this.notifications$.next(updated);
    this.unreadCount$.next(0);
  }

  add(notification: AppNotification): void {
    const current = this.notifications$.getValue();
    this.notifications$.next([notification, ...current]);
    this.updateUnreadCount(this.notifications$.getValue());
  }

  private updateUnreadCount(list: AppNotification[]): void {
    this.unreadCount$.next(list.filter(n => !n.read).length);
  }
}
