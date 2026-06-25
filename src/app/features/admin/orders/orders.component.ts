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

  // Modal state
  modalVisible = false;
  modalAction: 'approve' | 'reject' = 'approve';
  selectedOrder: RechargeRequest | null = null;
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
      ? this.adminService.getRechargesByStatus(this.statusFilter as RechargeStatus)
      : this.adminService.getRechargeRequests();

    obs.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.orders         = data;
          this.filteredOrders = data;
        },
        complete: () => { this.loading = false; },
        error: () => { this.loading = false; this.message.error('Erreur lors du chargement des commandes'); }
      });
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

  openModal(order: RechargeRequest, action: 'approve' | 'reject'): void {
    this.selectedOrder = order;
    this.modalAction = action;
    this.modalVisible = true;
  }

  closeModal(): void {
    if (!this.processing) {
      this.modalVisible = false;
      this.selectedOrder = null;
    }
  }

  confirmAction(): void {
    if (!this.selectedOrder) return;
    this.processing = true;
    const accept = this.modalAction === 'approve';

    this.adminService.validateRecharge(this.selectedOrder.id, accept)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success(accept ? 'Recharge validée avec succès' : 'Recharge rejetée');
          this.modalVisible = false;
          this.selectedOrder = null;
          this.processing = false;
          this.loadOrders();
        },
        error: () => {
          this.processing = false;
          this.message.error('Erreur lors du traitement');
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
}
