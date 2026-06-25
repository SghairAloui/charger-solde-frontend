import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {Subject, takeUntil} from 'rxjs';
import {AuthService} from '../../../core/services/auth.service';
import {NotificationService, AppNotification} from '../../../core/services/notification.service';
import {WebSocketService} from '../../../core/services/websocket.service';
import {User} from '../../../core/models/user.model';
import {ROUTES} from '../../../core/constants/app.constants';
import {ThemeService} from '../../../core/services/theme.service';
import {DateFormatPipe} from '../../pipes/date-format.pipe';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    NzIconModule, NzAvatarModule, NzDropDownModule, NzBadgeModule, DateFormatPipe
  ],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.scss'
})
export class ClientLayoutComponent implements OnInit, OnDestroy {
  user: User | null = null;
  unreadCount      = 0;
  unreadMessages   = 0;
  notifications: AppNotification[] = [];
  sidebarCollapsed = false;
  notifPanelOpen   = false;
  headerMenuOpen   = false;
  greeting         = 'Bonjour';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly webSocketService: WebSocketService,
    private readonly router: Router,
    public readonly themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    this.setGreeting();

    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifs => {
        this.notifications = notifs.slice(0, 20);
      });

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.unreadCount = count);

    this.webSocketService.connect();

    this.webSocketService.unreadMessageCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.unreadMessages = count);
  }

  private setGreeting(): void {
    const h = new Date().getHours();
    if (h < 12)      this.greeting = '☀️ Bonjour';
    else if (h < 18) this.greeting = '🌤️ Bon après-midi';
    else             this.greeting = '🌙 Bonsoir';
  }

  toggleSidebar(): void    { this.sidebarCollapsed = !this.sidebarCollapsed; }
  toggleNotifPanel(): void {
    this.notifPanelOpen = !this.notifPanelOpen;
    if (this.notifPanelOpen) { this.notificationService.markAllAsRead(); }
  }

  getNotifIcon(type: string): string {
    const map: Record<string, string> = {
      RECHARGE: 'thunderbolt',
      MESSAGE: 'message',
      CLAIM: 'file-exclamation',
      SYSTEM: 'info-circle'
    };
    return map[type] || 'bell';
  }

  goToNotif(n: AppNotification): void {
    this.notificationService.markAsRead(n.id);
    const routeMap: Record<string, string> = {
      RECHARGE: '/client/orders',
      MESSAGE: '/client/messaging',
      CLAIM: '/client/claims',
      SYSTEM: '/client/dashboard'
    };
    this.router.navigate([routeMap[n.type] || '/client/dashboard']);
    this.notifPanelOpen = false;
  }

  toggleHeaderMenu(): void { this.headerMenuOpen = !this.headerMenuOpen; }

  closeHeaderMenu(): void { this.headerMenuOpen = false; }

  goToMessaging(): void {
    this.webSocketService.resetUnreadMessages();
    this.router.navigate(['/client/messaging']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate([ROUTES.AUTH.LOGIN]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
