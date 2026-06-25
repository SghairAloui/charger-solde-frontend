import {Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';
import {ChatService, MessageDTO} from '../../../core/services/chat.service';
import {WebSocketService, ChatMessage} from '../../../core/services/websocket.service';
import {AuthService} from '../../../core/services/auth.service';
import {Subject, takeUntil} from 'rxjs';

interface Conversation {
  userId: number;
  userName: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
}

@Component({
  selector: 'app-admin-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, NzToolTipModule, PageHeaderComponent, DateFormatPipe],
  templateUrl: './messaging.component.html',
  styleUrl: './messaging.component.scss'
})
export class MessagingComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesWrap') messagesWrap!: ElementRef<HTMLElement>;

  allMessages: MessageDTO[] = [];
  conversations: Conversation[] = [];
  filteredConversations: Conversation[] = [];
  selectedConv: Conversation | null = null;
  messages: MessageDTO[] = [];
  newMessage   = '';
  convSearch   = '';
  isTyping     = false;
  loading      = true;
  sending      = false;
  private shouldScroll = false;
  private readonly destroy$ = new Subject<void>();
  private readonly adminId: number;
  private readonly colors = ['#6C5CE7','#00CEC9','#e17055','#00b894','#fdcb6e','#74b9ff','#a29bfe','#fd79a8'];

  constructor(
    private readonly chatService: ChatService,
    private readonly webSocketService: WebSocketService,
    private readonly authService: AuthService,
    private readonly message: NzMessageService,
    private readonly route: ActivatedRoute
  ) {
    this.adminId = this.authService.getCurrentUser()?.id ?? 1;
  }

  ngOnInit(): void {
    this.chatService.getAllMessages().subscribe({
      next: msgs => {
        this.allMessages = msgs;
        this.buildConversations();
        this.loading = false;
        // Auto-select conversation if clientId query param is present
        const clientIdParam = this.route.snapshot.queryParamMap.get('clientId');
        if (clientIdParam) {
          const clientId = +clientIdParam;
          const conv = this.filteredConversations.find(c => c.userId === clientId);
          if (conv) {
            this.selectConversation(conv);
          }
        }
      },
      error: () => { this.loading = false; this.message.error('Erreur lors du chargement des messages'); }
    });

    // Subscribe to real-time incoming messages
    this.webSocketService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        const dto = msg as unknown as MessageDTO;
        // Dedup: skip if message already exists
        if (!this.allMessages.some(m => m.id && m.id === dto.id)) {
          this.allMessages.push(dto);
        }
        // Update conversation if open
        if (this.selectedConv && (msg.senderId === this.selectedConv.userId || msg.receiverId === this.selectedConv.userId)) {
          if (!this.messages.some(m => m.id && m.id === dto.id)) {
            this.messages.push(dto);
            this.shouldScroll = true;
            this.isTyping = false;
          }
        }
        // Update conversation list
        const otherId = dto.senderId === this.adminId ? dto.receiverId : dto.senderId;
        const conv = this.conversations.find(c => c.userId === otherId);
        if (conv) {
          conv.lastMessage = dto.content;
          conv.lastTime    = dto.createdAt;
          if (!this.selectedConv || this.selectedConv.userId !== otherId) {
            conv.unread++;
          }
        } else {
          // New conversation from a client we haven't chatted with
          this.buildConversations();
        }
        this.filterConversations();
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private buildConversations(): void {
    const convMap = new Map<number, Conversation>();
    this.allMessages.forEach(msg => {
      const otherId   = msg.senderId === this.adminId ? msg.receiverId : msg.senderId;
      const otherName = msg.senderId === this.adminId ? `Utilisateur #${msg.receiverId}` : msg.senderName;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, { userId: otherId, userName: otherName, lastMessage: msg.content, lastTime: msg.createdAt, unread: 0 });
      } else {
        const c = convMap.get(otherId)!;
        c.lastMessage = msg.content;
        c.lastTime    = msg.createdAt;
      }
      if (!msg.isRead && msg.senderId !== this.adminId) {
        convMap.get(otherId)!.unread++;
      }
    });
    this.conversations = Array.from(convMap.values());
    this.filteredConversations = [...this.conversations];
  }

  filterConversations(): void {
    const term = this.convSearch.toLowerCase().trim();
    this.filteredConversations = term
      ? this.conversations.filter(c => c.userName.toLowerCase().includes(term))
      : [...this.conversations];
  }

  selectConversation(conv: Conversation): void {
    this.selectedConv = conv;
    conv.unread       = 0;
    // Filter messages belonging to this conversation
    this.messages = this.allMessages.filter(m =>
      (m.senderId === this.adminId && m.receiverId === conv.userId) ||
      (m.senderId === conv.userId  && m.receiverId === this.adminId)
    );
    // Load fresh from API
    this.chatService.getConversation(conv.userId).subscribe({
      next: msgs => { this.messages = msgs; this.shouldScroll = true; },
      error: ()   => { this.shouldScroll = true; this.message.error('Erreur lors du chargement de la conversation'); }
    });
  }

  // Build a conversation entry for a client with no messages yet
  buildEmptyConversation(clientId: number, clientName: string): Conversation {
    return {
      userId: clientId,
      userName: clientName,
      lastMessage: '',
      lastTime: '',
      unread: 0
    };
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || !this.selectedConv || this.sending) return;
    this.sending = true;
    this.chatService.sendMessage(this.selectedConv.userId, text).subscribe({
      next: sent => {
        this.allMessages.push(sent);
        this.newMessage   = '';
        this.sending      = false;
        if (this.selectedConv) {
          this.selectedConv.lastMessage = sent.content;
          this.selectedConv.lastTime    = sent.createdAt;
        }
        // Message will be displayed via WebSocket subscription
      },
      error: () => { this.sending = false; this.message.error('Erreur lors de l\'envoi du message'); }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isSentByAdmin(msg: MessageDTO): boolean {
    return msg.senderId === this.adminId;
  }

  private scrollToBottom(): void {
    if (this.messagesWrap?.nativeElement) {
      const el = this.messagesWrap.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  getColor(name: string): string {
    return this.colors[name.charCodeAt(0) % this.colors.length];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
