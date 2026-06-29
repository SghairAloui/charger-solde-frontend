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
  orders:  RechargeRequest[] = [];
  loading  = false;
  activeTab: Tab = 'all';

  private readonly destroy$ = new Subject<void>();

 get pendingOrders(): RechargeRequest[] {
  return this.sortedOrders.filter(o => o.status === 'PENDING');
}

get validatedOrders(): RechargeRequest[] {
  return this.sortedOrders.filter(o => o.status === 'VALIDATED');
}

get rejectedOrders(): RechargeRequest[] {
  return this.sortedOrders.filter(o =>
    o.status === 'REJECTED' ||
    o.status === 'ADMIN_CANCELLED'
  );
}

get displayedOrders(): RechargeRequest[] {
  switch (this.activeTab) {
    case 'pending':   return this.pendingOrders;
    case 'validated': return this.validatedOrders;
    case 'rejected':  return this.rejectedOrders;
    default:          return this.sortedOrders;
  }
}

  setTab(tab: Tab): void { this.activeTab = tab; }

  constructor(
    private readonly clientService: ClientService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.clientService.getMyRecharges()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:     (data) => { this.orders = data; },
        complete: ()     => { this.loading = false; },
        error:    ()     => { this.loading = false; this.message.error('Erreur lors du chargement des commandes'); }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get sortedOrders(): RechargeRequest[] {
  return [...this.orders].sort((a: RechargeRequest, b: RechargeRequest) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
}
