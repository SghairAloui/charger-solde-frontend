import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { AdminService, ClientBalanceResponse } from '../../../core/services/admin.service';

interface BalanceModalData {
  clientId: number;
  clientName: string;
  clientEmail: string;
}

@Component({
  selector: 'app-client-balance-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, NzDatePickerModule],
  templateUrl: './client-balance-detail.component.html',
  styleUrl: './client-balance-detail.component.scss'
})
export class ClientBalanceDetailComponent implements OnInit {
  clientId: number;
  clientName: string;
  clientEmail: string;

  dateRange: Date[] = [];
  balanceData: ClientBalanceResponse | null = null;
  loading = false;
  paying = false;

  constructor(
    @Inject(NZ_MODAL_DATA) data: BalanceModalData,
    private readonly adminService: AdminService,
    private readonly message: NzMessageService,
    private readonly modal: NzModalService,
    private readonly modalRef: NzModalRef
  ) {
    this.clientId = data.clientId;
    this.clientName = data.clientName;
    this.clientEmail = data.clientEmail;
  }

ngOnInit(): void {
  this.dateRange = [new Date(), new Date()];
  this.loadBalance();
}

  onDateRangeChange(dates: Date[]): void {
    if (dates?.length === 2) {
      this.dateRange = dates;
      this.loadBalance();
    }
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  loadBalance(): void {
    if (this.dateRange?.length !== 2) return;
    this.loading = true;

    const startDate = this.formatDate(this.dateRange[0]);
    const endDate = this.formatDate(this.dateRange[1]);

    this.adminService.getClientBalance(this.clientId, startDate, endDate).subscribe({
      next: (data) => {
        this.balanceData = data;
        this.loading = false;
      },
      error: () => {
        this.message.error('Erreur lors du chargement du solde');
        this.loading = false;
      }
    });
  }

  confirmPay(): void {
    if (!this.balanceData || this.balanceData.totalBalance <= 0) {
      this.message.info('Aucun solde à payer.');
      return;
    }

    this.modal.confirm({
      nzTitle: 'Confirmer le paiement',
      nzContent: `Marquer le solde de ${this.balanceData.totalBalance} TND comme payé pour ${this.clientName} ?`,
      nzOkText: 'Payer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () => this.payClient()
    });
  }

  private payClient(): void {
    this.paying = true;
    this.adminService.payClient(this.clientId).subscribe({
      next: () => {
        this.message.success('Client payé avec succès');
        this.paying = false;
        this.loadBalance();
      },
      error: () => {
        this.message.error('Erreur lors du paiement');
        this.paying = false;
      }
    });
  }

  close(): void {
    this.modalRef.close();
  }
}