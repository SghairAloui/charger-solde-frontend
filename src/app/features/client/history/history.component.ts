import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {ClientService} from '../../../core/services/client.service';
import {RechargeRequest} from '../../../core/models/recharge-request.model';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {StatusLabelPipe} from '../../../shared/pipes/status-label.pipe';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule, RouterLink, NzIconModule, PageHeaderComponent, StatusLabelPipe, DateFormatPipe],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit, OnDestroy {

  orders: RechargeRequest[] = [];

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

  loadOrders(): void {
    this.clientService.getMyRecharges(this.page, this.size)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.orders = res.content;
          this.total = res.totalElements;
        },
        error: () => {
          this.message.error('Erreur lors du chargement de l\'historique');
        }
      });
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}