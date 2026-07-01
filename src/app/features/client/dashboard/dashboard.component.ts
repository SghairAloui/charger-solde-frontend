import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Subject, takeUntil } from 'rxjs';
import { ClientService } from '../../../core/services/client.service';
import { OperatorService } from '../../../core/services/operator.service';
import { RechargeRequest } from '../../../core/models/recharge-request.model';
import { Operator } from '../../../core/models/operator.model';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { SystemAlert } from '../../../core/services/admin.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, NzIconModule, NzButtonModule, NzTagModule,
    StatusLabelPipe, DateFormatPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  orders: RechargeRequest[] = [];
  operators: Operator[] = [];
  loading = false;
  alerts: SystemAlert[] = [];
  page = 0;
  size = 10;
  total = 0;
  private readonly destroy$ = new Subject<void>();

  private readonly opColors: Record<string, string> = {
    'ooredoo': '#e3003e',
    'orange': '#ff7900',
    'tunisie telecom': '#003366',
    'tt': '#74b9ff'
  };

  get totalOrders(): number { return this.orders.length; }
  get pendingOrders(): number { return this.orders.filter(o => o.status === 'PENDING').length; }
  get validatedOrders(): number { return this.orders.filter(o => o.status === 'VALIDATED').length; }
  get rejectedOrders(): number { return this.orders.filter(o => o.status === 'REJECTED').length; }
  get totalSpent(): number {
    return this.orders
      .filter(o => o.status === 'VALIDATED')
      .reduce((sum, o) => sum + (o.amount || 0), 0);
  }
  get recentOrders(): RechargeRequest[] {
    return [...this.orders]
      .sort((a: RechargeRequest, b: RechargeRequest) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, 5);
  }
  constructor(
    private readonly clientService: ClientService,
    private readonly operatorService: OperatorService,
    private readonly message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.loading = true;
  this.loadAlerts();

    this.clientService.getAllMyRecharges()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.orders = data;   // ✅ FULL DATA
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.message.error('Erreur dashboard');
        }
      });

    this.operatorService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.operators = data);
  }
  getOpColor(name?: string): string {
    if (!name) return '#6C5CE7';
    return this.opColors[name.toLowerCase()] || '#6C5CE7';
  }

  getOpInitial(name: string): string {
    if (!name) return '?';
    const lower = name.toLowerCase();
    if (lower.includes('ooredoo')) return 'O';
    if (lower.includes('orange')) return 'O';
    if (lower.includes('tunisie') || lower.includes('tt')) return 'TT';
    return name.charAt(0).toUpperCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAlerts(): void {
  this.clientService.getActiveAlerts()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.alerts = data;
      },
      error: () => {
        this.alerts = [];
        this.message.error('Erreur chargement alertes');
      }
    });
}
removeAlert(index: number): void {
  this.alerts.splice(index, 1);
}
}
