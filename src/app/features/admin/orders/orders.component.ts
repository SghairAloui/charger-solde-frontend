import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzPopconfirmModule} from 'ng-zorro-antd/popconfirm';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {AdminService} from '../../../core/services/admin.service';
import {RechargeRequest} from '../../../core/models/recharge-request.model';
import {RechargeStatus} from '../../../core/enums/recharge-status.enum';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {StatusLabelPipe} from '../../../shared/pipes/status-label.pipe';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NzIconModule, NzPopconfirmModule, NzToolTipModule,
    PageHeaderComponent, StatusLabelPipe, DateFormatPipe
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: RechargeRequest[] = [];
  filteredOrders: RechargeRequest[] = [];
  loading      = false;
  statusFilter: RechargeStatus | '' = '';
  searchTerm   = '';
copiedPhone = false;
currentPage = 0;
totalPages = 0;
  // Modal state

  processing = false;

  // expose enum values for template binding
  readonly STATUS_PENDING   = RechargeStatus.PENDING;
  readonly STATUS_VALIDATED = RechargeStatus.VALIDATED;
  readonly STATUS_REJECTED  = RechargeStatus.REJECTED;

  private readonly destroy$ = new Subject<void>();
  private readonly colors = ['#6C5CE7','#00CEC9','#e17055','#00b894','#fdcb6e','#74b9ff','#a29bfe','#fd79a8'];

  get pendingCount(): number { return this.orders.filter(o => o.status === 'PENDING').length; }

  constructor(
    private readonly adminService: AdminService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void { this.loadOrders(); }

  setFilter(status: RechargeStatus | ''): void {
    this.statusFilter = status;
    this.loadOrders();
  }
loadOrders(): void {
  this.loading = true;

  const obs = this.statusFilter
    ? this.adminService.getRechargesByStatus(
        this.statusFilter as RechargeStatus,
        this.currentPage
      )
    : this.adminService.getRechargeRequests(this.currentPage);

  obs.pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {

        const sortedOrders: RechargeRequest[] = res.content.sort(
          (a: RechargeRequest, b: RechargeRequest) => {
            return new Date(b.createdAt).getTime()
                 - new Date(a.createdAt).getTime();
          }
        );

        this.orders = sortedOrders;
        this.filteredOrders = sortedOrders;

        this.totalPages = res.totalPages;
      },

      complete: () => this.loading = false,

      error: () => {
        this.loading = false;
        this.message.error('Erreur lors du chargement des commandes');
      }
    });
}

nextPage(): void {
  if (this.currentPage < this.totalPages - 1) {
    this.currentPage++;
    this.loadOrders();
  }
}

prevPage(): void {
  if (this.currentPage > 0) {
    this.currentPage--;
    this.loadOrders();
  }
}

goToPage(page: number): void {
  this.currentPage = page;
  this.loadOrders();
}

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredOrders = term
      ? this.orders.filter(o =>
          o.phoneNumber.includes(term) ||
          o.client?.nom.toLowerCase().includes(term) ||
          o.client?.prenom.toLowerCase().includes(term))
      : [...this.orders];
  }

  clearSearch(): void {
    this.searchTerm     = '';
    this.filteredOrders = [...this.orders];
  }



confirmAction(order: RechargeRequest, accept: boolean): void {

  this.processing = true;

  this.adminService.validateRecharge(order.id, accept)
    .pipe(takeUntil(this.destroy$))
    .subscribe({

      next: () => {

        this.message.success(
          accept
            ? '✅ Recharge validée avec succès'
            : '❌ Recharge rejetée'
        );

        this.processing = false;

        this.loadOrders();
      },


      error: () => {

        this.processing = false;

        this.message.error(
          'Erreur lors du traitement'
        );

      }

    });
}

  getColor(name: string): string {
    if (!name) return this.colors[0];
    return this.colors[name.charCodeAt(0) % this.colors.length];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

copyPhone(phone: string): void {
  if (!phone) return;

  navigator.clipboard.writeText(phone).then(() => {
    this.copiedPhone = true;

    setTimeout(() => {
      this.copiedPhone = false;
    }, 1500); // disparaît après 1.5s
  });
}

}
