import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {NotificationService, AppNotification} from '../../../core/services/notification.service';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';

type FilterType = 'ALL' | 'UNREAD' | 'RECHARGE' | 'MESSAGE';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, NzIconModule, PageHeaderComponent, DateFormatPipe],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  filteredNotifications: AppNotification[] = [];
  activeFilter: FilterType = 'ALL';
  unreadCount = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(n => {
        this.notifications = n;
        this.applyFilter();
      });

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(c => this.unreadCount = c);
  }

  setFilter(filter: FilterType): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  private applyFilter(): void {
    switch (this.activeFilter) {
      case 'UNREAD':   this.filteredNotifications = this.notifications.filter(n => !n.read); break;
      case 'RECHARGE': this.filteredNotifications = this.notifications.filter(n => n.type === 'RECHARGE'); break;
      case 'MESSAGE':  this.filteredNotifications = this.notifications.filter(n => n.type === 'MESSAGE'); break;
      default:         this.filteredNotifications = [...this.notifications];
    }
  }

  getIcon(type: string): string {
    const map: Record<string, string> = {
      RECHARGE: 'thunderbolt',
      MESSAGE:  'message',
      CLAIM:    'file-exclamation',
      SYSTEM:   'info-circle'
    };
    return map[type] || 'bell';
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
    this.message.success('Notification marquée comme lue');
  }
  markAllRead(): void {
    this.notificationService.markAllAsRead();
    this.message.success('Toutes les notifications marquées comme lues');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
