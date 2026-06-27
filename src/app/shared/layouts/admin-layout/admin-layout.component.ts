import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NzLayoutModule} from 'ng-zorro-antd/layout';
import {NzMenuModule} from 'ng-zorro-antd/menu';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzBadgeModule} from 'ng-zorro-antd/badge';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzDropDownModule} from 'ng-zorro-antd/dropdown';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {Subject, takeUntil, filter} from 'rxjs';
import {AuthService} from '../../../core/services/auth.service';
import {NotificationService, AppNotification} from '../../../core/services/notification.service';
import {WebSocketService} from '../../../core/services/websocket.service';
import {User} from '../../../core/models/user.model';
import {ROUTES} from '../../../core/constants/app.constants';
import {DateFormatPipe} from '../../pipes/date-format.pipe';
import {ThemeService} from '../../../core/services/theme.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive,
    NzLayoutModule, NzMenuModule, NzIconModule, NzBadgeModule,
    NzAvatarModule, NzDropDownModule, NzToolTipModule, DateFormatPipe
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  user: User | null = null;
  unreadCount    = 0;
  unreadMessages = 0;
  notifications: AppNotification[] = [];
  sidebarOpen      = false;
  sidebarCollapsed = false;
  isMobileView     = false;
  notifPanelOpen   = false;
  searchOpen       = false;
  searchQuery      = '';
  currentRoute     = 'Tableau de bord';
  hasNewNotif      = false;
  wsConnected      = false;
  headerMenuOpen   = false;

  private readonly destroy$ = new Subject<void>();

  // Route label map
  private routeLabels: Record<string, string> = {
    '/admin/dashboard':     'Tableau de bord',
    '/admin/clients':       'Clients',
    '/admin/operators':     'Opérateurs',
    '/admin/offers':        'Offres',
    '/admin/orders':        'Commandes',
    '/admin/notifications': 'Notifications',
    '/admin/messaging':     'Messagerie',
    '/admin/claims':        'Réclamations',
    '/admin/client-history': 'Historique des recharges',
    '/admin/profile':       'Mon profil'
  };

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly webSocketService: WebSocketService,
    private readonly router: Router,
    public readonly themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.updateViewportState();
    this.user = this.authService.getCurrentUser();

    // Track notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifs => {
        this.notifications = notifs.slice(0, 20);
      });

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        if (count > this.unreadCount) { this.hasNewNotif = true; }
        this.unreadCount = count;
      });

    // Track WebSocket status
    this.webSocketService.connected$
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => this.wsConnected = c);

    // Track current route
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((e) => {
      const url = (e as NavigationEnd).urlAfterRedirects;
      this.currentRoute = this.routeLabels[url] || 'Admin';
      if (this.isMobileView) {
        this.sidebarOpen = false;
      }
    });

    // Set initial route label
    this.currentRoute = this.routeLabels[this.router.url] || 'Tableau de bord';

    // Connect WebSocket
    this.webSocketService.connect();

    this.webSocketService.unreadMessageCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => this.unreadMessages = count);
  }

  toggleSidebar(): void {
    if (this.isMobileView) {
      this.sidebarOpen = !this.sidebarOpen;
      return;
    }
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  closeSidebar(): void {
    if (this.isMobileView) {
      this.sidebarOpen = false;
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateViewportState();
  }

  private updateViewportState(): void {
    this.isMobileView = window.innerWidth <= 768;

    if (this.isMobileView) {
      this.sidebarCollapsed = false;
      this.sidebarOpen = false;
      return;
    }

    this.sidebarOpen = false;
  }

  toggleNotifPanel(): void {
    this.notifPanelOpen = !this.notifPanelOpen;
    if (this.notifPanelOpen) { this.hasNewNotif = false; }
  }

  toggleHeaderMenu(): void {
    this.headerMenuOpen = !this.headerMenuOpen;
  }

  closeHeaderMenu(): void {
    this.headerMenuOpen = false;
  }

  goToMessaging(): void {
    this.webSocketService.resetUnreadMessages();
    this.router.navigate(['/admin/messaging']);
  }

  toggleSearch(): void {
    this.searchOpen = true;
    setTimeout(() => {
      (document.querySelector('.header-search__input-wrap input') as HTMLElement)?.focus();
    }, 100);
  }

  closeSearch(): void {
    this.searchOpen  = false;
    this.searchQuery = '';
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead();
  }

  markNotifRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  getNotifIcon(type: string): string {
    const map: Record<string, string> = {
      RECHARGE: 'thunderbolt',
      MESSAGE:  'message',
      CLAIM:    'file-exclamation',
      SYSTEM:   'info-circle'
    };
    return map[type] || 'bell';
  }

  notifRoute(type: string): string {
    const map: Record<string, string> = {
      RECHARGE: '/admin/orders',
      MESSAGE:  '/admin/messaging',
      CLAIM:    '/admin/claims',
      SYSTEM:   '/admin/notifications'
    };
    return map[type] || '/admin/notifications';
  }

  goToNotif(n: AppNotification): void {
    this.markNotifRead(n.id);
    const route = this.notifRoute(n.type);
    this.router.navigate([route]).then(() => {
      this.notifPanelOpen = false;
    });
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
