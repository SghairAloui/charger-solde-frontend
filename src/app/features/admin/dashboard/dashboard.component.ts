import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';
import { AdminService, ClientRechargeSummary } from '../../../core/services/admin.service';
import { AdminDashboard } from '../../../core/models/admin-dashboard.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RechargeRequest } from '../../../core/models/recharge-request.model';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    NzIconModule, NzToolTipModule,
    StatCardComponent, PageHeaderComponent,
    StatusLabelPipe, DateFormatPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: AdminDashboard | null = null;
  recentRecharges: RechargeRequest[] = [];
  clientSummaries: ClientRechargeSummary[] = [];
  loading = false;
  pendingCount = 0;
  today = new Date();

  greeting = { emoji: '☀️', text: 'Bonjour' };
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  private readonly destroy$ = new Subject<void>();

  // Avatar color palette
  private readonly avatarColors = [
    '#6C5CE7', '#00CEC9', '#e17055', '#00b894', '#fdcb6e', '#74b9ff', '#a29bfe', '#fd79a8'
  ];

  constructor(
    private readonly adminService: AdminService,
    private readonly message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.setGreeting();
    this.loadData();
  }

  private setGreeting(): void {
    const h = new Date().getHours();
    if (h < 12) this.greeting = { emoji: '☀️', text: 'Bonjour' };
    else if (h < 18) this.greeting = { emoji: '🌤️', text: 'Bon après-midi' };
    else this.greeting = { emoji: '🌙', text: 'Bonsoir' };
  }

  loadData(): void {
    this.loading = true;

    this.adminService.getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: () => {
          this.message.error('Erreur dashboard');
        }
      });

    this.adminService.getRechargeRequests(this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.recentRecharges = res.content;   // ✅ les 10 commandes
          this.totalPages = res.totalPages;

          this.pendingCount = res.content
            .filter((r: RechargeRequest) => r.status === 'PENDING')
            .length;
        },
        error: () => {
          this.message.error('Erreur recharges');
        },
        complete: () => {
          this.loading = false;
        }
      });

    this.adminService.getClientRechargeSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(summaries => {
        this.clientSummaries = summaries;
      });
  }
  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadData();
    }
  }

  refresh(): void { this.loadData(); }

  validate(id: number, accept: boolean): void {
    this.adminService.validateRecharge(id, accept)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success(accept ? '✅ Recharge validée' : '❌ Recharge rejetée');
          this.loadData();
        },
        error: () => this.message.error('Erreur lors de la validation')
      });
  }

  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    const idx = name.charCodeAt(0) % this.avatarColors.length;
    return this.avatarColors[idx];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
