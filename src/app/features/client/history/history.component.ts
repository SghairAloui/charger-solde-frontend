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
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly clientService: ClientService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.clientService.getMyRecharges()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => { this.orders = data; },
        error: () => { this.message.error('Erreur lors du chargement de l\'historique'); }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
