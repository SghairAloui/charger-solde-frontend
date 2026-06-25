import {
  Component, ViewChild, ElementRef, AfterViewChecked,
  OnInit, OnDestroy
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';
import {ChatService, MessageDTO} from '../../../core/services/chat.service';
import {WebSocketService, ChatMessage} from '../../../core/services/websocket.service';
import {AuthService} from '../../../core/services/auth.service';
import {Subject, takeUntil} from 'rxjs';

// Admin user ID — the "support" agent client messages go to
const SUPPORT_ADMIN_ID = 1;

@Component({
  selector: 'app-client-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, PageHeaderComponent, DateFormatPipe],
  templateUrl: './messaging.component.html',
  styleUrl: './messaging.component.scss'
})
export class MessagingComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesWrap') messagesWrap!: ElementRef<HTMLElement>;

  messages: MessageDTO[] = [];
  newMessage  = '';
  isTyping    = false;
  sending     = false;
  loading     = true;

  private shouldScroll = false;
  private readonly destroy$ = new Subject<void>();
  private readonly currentUserId: number;

  constructor(
    private readonly chatService: ChatService,
    private readonly webSocketService: WebSocketService,
    private readonly authService: AuthService,
    private readonly message: NzMessageService
  ) {
    this.currentUserId = this.authService.getCurrentUser()?.id ?? 0;
  }

  ngOnInit(): void {
    // Load existing conversation with admin/support
    this.chatService.getConversation(SUPPORT_ADMIN_ID).subscribe({
      next: msgs => {
        this.messages = msgs;
        this.loading  = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.loading = false;
        this.message.error('Erreur lors du chargement de la conversation');
        // Fallback welcome message
        this.messages = [{
          senderId: SUPPORT_ADMIN_ID,
          senderName: 'Support',
          receiverId: this.currentUserId,
          content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
          isRead: false,
          createdAt: new Date().toISOString()
        } as MessageDTO];
      }
    });

    // Subscribe to real-time incoming messages
    this.webSocketService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(msg => {
        // Push messages from admin OR messages sent by us (dedup by id)
        const isFromAdmin = msg.senderId === SUPPORT_ADMIN_ID;
        const isFromMe = msg.senderId === this.currentUserId;
        if (isFromAdmin || isFromMe) {
          // Dedup: skip if message already exists in array
          if (!this.messages.some(m => m.id && m.id === msg.id)) {
            this.isTyping = false;
            this.messages.push({...msg} as unknown as MessageDTO);
            this.shouldScroll = true;
          }
        }
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  isSentByMe(msg: MessageDTO): boolean {
    return msg.senderId === this.currentUserId;
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    if (!text || this.sending) return;

    this.sending = true;
    this.chatService.sendMessage(SUPPORT_ADMIN_ID, text).subscribe({
      next: sent => {
        this.messages.push(sent);
        this.newMessage   = '';
        this.sending      = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.newMessage   = '';
        this.sending      = false;
        this.message.error('Erreur lors de l\'envoi du message');
      }
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    if (this.messagesWrap?.nativeElement) {
      const el = this.messagesWrap.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
