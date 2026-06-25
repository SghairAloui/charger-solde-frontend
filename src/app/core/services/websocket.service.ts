import {Injectable, OnDestroy} from '@angular/core';
import {Client, IMessage} from '@stomp/stompjs';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {TokenService} from './token.service';
import {NotificationService} from './notification.service';
import {NzNotificationService} from 'ng-zorro-antd/notification';
import {RechargeRequest} from '../models/recharge-request.model';

export interface ChatMessage {
  id?: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({providedIn: 'root'})
export class WebSocketService implements OnDestroy {
  private readonly client: Client;
  private readonly connected = new BehaviorSubject<boolean>(false);
  private readonly destroy$ = new Subject<void>();
  private readonly adminRecharges = new Subject<RechargeRequest>();
  private readonly clientNotifications = new Subject<string>();
  private readonly incomingMessages = new Subject<ChatMessage>();
  private readonly unreadMessageCount = new BehaviorSubject<number>(0);

  readonly connected$: Observable<boolean> = this.connected.asObservable();
  readonly adminRecharges$: Observable<RechargeRequest> = this.adminRecharges.asObservable();
  readonly clientNotifications$: Observable<string> = this.clientNotifications.asObservable();
  readonly messages$: Observable<ChatMessage> = this.incomingMessages.asObservable();
  readonly unreadMessageCount$: Observable<number> = this.unreadMessageCount.asObservable();

  constructor(
    private readonly tokenService: TokenService,
    private readonly notificationService: NotificationService,
    private readonly nzNotification: NzNotificationService
  ) {
    this.client = new Client({
      brokerURL: environment.wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${this.tokenService.getToken()}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    });

    this.client.onConnect = () => {
      this.connected.next(true);
      this.subscribeToTopics();
    };

    this.client.onDisconnect = () => {
      this.connected.next(false);
    };
  }

  connect(): void {
    if (!this.client.active) {
      const token = this.tokenService.getToken();
      if (token) {
        this.client.connectHeaders = {
          Authorization: `Bearer ${token}`
        };
      }
      this.client.activate();
    }
  }

  disconnect(): void {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  private subscribeToTopics(): void {
    const user = this.tokenService.getUser();

    if (user?.role === 'ROLE_ADMIN') {
      this.client.subscribe('/topic/admin/recharges', (message: IMessage) => {
        const text = message.body;
        this.notificationService.add({
          id: Date.now(),
          type: 'RECHARGE',
          title: 'Nouvelle demande',
          message: text,
          read: false,
          createdAt: new Date().toISOString()
        });
        this.nzNotification.info('Nouvelle demande de recharge', text, { nzDuration: 5000, nzPlacement: 'bottomRight' });
      });

      this.client.subscribe('/topic/admin/claims', (message: IMessage) => {
        const text = message.body;
        this.notificationService.add({
          id: Date.now(),
          type: 'CLAIM',
          title: 'Nouvelle réclamation',
          message: text,
          read: false,
          createdAt: new Date().toISOString()
        });
        this.nzNotification.info('Nouvelle réclamation', text, { nzDuration: 5000, nzPlacement: 'bottomRight' });
      });
    }

    if (user) {
      this.client.subscribe(`/topic/messages.${user.id}`, (message: IMessage) => {
        try {
          const chatMsg: ChatMessage = JSON.parse(message.body);
          this.incomingMessages.next(chatMsg);
          this.unreadMessageCount.next(this.unreadMessageCount.getValue() + 1);
        } catch (e) {
          console.error('Erreur parsing message WebSocket:', e);
        }
      });

      this.client.subscribe(`/topic/notifications.${user.id}`, (message: IMessage) => {
        const text = message.body;
        this.notificationService.add({
          id: Date.now(),
          type: 'SYSTEM',
          title: 'Notification',
          message: text,
          read: false,
          createdAt: new Date().toISOString()
        });
        this.nzNotification.info('Notification', text, { nzDuration: 6000, nzPlacement: 'bottomRight' });
      });
    }
  }

  send(destination: string, body: unknown): void {
    if (this.client.active) {
      this.client.publish({
        destination: `/app${destination}`,
        body: JSON.stringify(body)
      });
    }
  }

  resetUnreadMessages(): void {
    this.unreadMessageCount.next(0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
