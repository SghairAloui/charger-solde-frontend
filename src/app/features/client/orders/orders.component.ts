import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {ClientService} from '../../../core/services/client.service';
import {RechargeRequest} from '../../../core/models/recharge-request.model';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {StatusLabelPipe} from '../../../shared/pipes/status-label.pipe';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';

type Tab = 'all' | 'pending' | 'validated' | 'rejected';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [CommonModule, NzIconModule, PageHeaderComponent, StatusLabelPipe, DateFormatPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {

  orders: RechargeRequest[] = [];
  loading = false;

  activeTab: Tab = 'all';

  page = 0;
  size = 10;
  total = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly clientService: ClientService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // =========================
  // LOAD ORDERS (PAGINATION)
  // =========================
  loadOrders(): void {
    this.loading = true;

    this.clientService.getMyRecharges(this.page, this.size)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.orders = res.content || [];
          this.total = res.totalElements || 0;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.message.error('Erreur lors du chargement des commandes');
        }
      });
  }

  // =========================
  // PAGINATION ACTIONS
  // =========================
  goToPage(i: number): void {
    this.page = i;
    this.loadOrders();
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadOrders();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadOrders();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.size);
  }

  // =========================
  // FILTERS
  // =========================
  setTab(tab: Tab): void {
    this.activeTab = tab;
  }

  get sortedOrders(): RechargeRequest[] {
    return [...this.orders].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  get pendingOrders(): RechargeRequest[] {
    return this.sortedOrders.filter(o => o.status === 'PENDING');
  }

  get validatedOrders(): RechargeRequest[] {
    return this.sortedOrders.filter(o => o.status === 'VALIDATED');
  }

  get rejectedOrders(): RechargeRequest[] {
    return this.sortedOrders.filter(o =>
      o.status === 'REJECTED' || o.status === 'ADMIN_CANCELLED'
    );
  }

  get displayedOrders(): RechargeRequest[] {
    switch (this.activeTab) {
      case 'pending': return this.pendingOrders;
      case 'validated': return this.validatedOrders;
      case 'rejected': return this.rejectedOrders;
      default: return this.sortedOrders;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}