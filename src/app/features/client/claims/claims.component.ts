import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';
import {ClaimService, ClaimDTO, ClaimStatus} from '../../../core/services/claim.service';
import {ClientService} from '../../../core/services/client.service';
import {RechargeRequest} from '../../../core/models/recharge-request.model';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
@Component({
  selector: 'app-client-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, PageHeaderComponent, DateFormatPipe,NzPaginationModule
],
  templateUrl: './claims.component.html',
  styleUrl:    './claims.component.scss'
})
export class ClaimsComponent implements OnInit {
  claims: ClaimDTO[] = [];
  orders: RechargeRequest[] = [];
  loading       = true;
  isModalVisible = false;
  submitting     = false;
newClaim = {
  phoneNumber: '',
  subject: ''
};
page = 0;
size = 10;
total = 0;
  constructor(
    private readonly claimService: ClaimService,
    private readonly clientService: ClientService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
    this.loadOrders();
  }

loadClaims(): void {
  this.loading = true;

  this.claimService.getMyClaims(this.page, this.size).subscribe({
    next: res => {
      this.claims = res.content;
      this.total = res.totalElements;
      this.loading = false;
    },
    error: () => {
      this.loading = false;
      this.message.error('Erreur lors du chargement des réclamations');
    }
  });
}
onPageChange(pageIndex: number): void {
  this.page = pageIndex - 1;
  this.loadClaims();
}

get totalPages(): number {
  return Math.ceil(this.total / this.size);
}
goToPage(i: number): void {
  this.page = i;
  this.loadClaims();
}

nextPage(): void {
  if (this.page < this.totalPages - 1) {
    this.page++;
    this.loadClaims();
  }
}

prevPage(): void {
  if (this.page > 0) {
    this.page--;
    this.loadClaims();
  }
}

  loadOrders(): void {
    this.clientService.getMyRecharges().subscribe({
      next: orders => { this.orders = orders; }
    });
  }

showCreateModal(): void {
  this.isModalVisible = true;
  this.newClaim = {
    phoneNumber: '',
    subject: ''
  };
}

  closeModal(): void { this.isModalVisible = false; }

submitClaim(): void {
  if (!this.newClaim.phoneNumber.trim() || !this.newClaim.subject.trim()) {
    this.message.warning('Veuillez remplir tous les champs obligatoires');
    return;
  }

  this.submitting = true;

  this.claimService.createClaim({
    phoneNumber: this.newClaim.phoneNumber,
    subject: this.newClaim.subject
  }).subscribe({
    next: claim => {
      this.claims.unshift(claim);
      this.isModalVisible = false;
      this.submitting = false;
      this.message.success('✅ Réclamation soumise avec succès');
    },
    error: () => {
      this.submitting = false;
      this.message.error('Erreur lors de la soumission');
    }
  });
}

  getStatusClass(status: ClaimStatus): string {
    const map: Record<ClaimStatus, string> = {
      PENDING:     'status--warning',
      IN_PROGRESS: 'status--info',
      RESOLVED:    'status--success',
      REJECTED:    'status--danger'
    };
    return map[status] || 'status--warning';
  }

  getStatusLabel(status: ClaimStatus): string {
    const map: Record<ClaimStatus, string> = {
      PENDING:     'En attente',
      IN_PROGRESS: 'En cours',
      RESOLVED:    'Résolu',
      REJECTED:    'Rejeté'
    };
    return map[status] || status;
  }
}
