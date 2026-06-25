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

@Component({
  selector: 'app-client-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, PageHeaderComponent, DateFormatPipe],
  templateUrl: './claims.component.html',
  styleUrl:    './claims.component.scss'
})
export class ClaimsComponent implements OnInit {
  claims: ClaimDTO[] = [];
  orders: RechargeRequest[] = [];
  loading       = true;
  isModalVisible = false;
  submitting     = false;
  newClaim       = {subject: '', description: '', orderId: null as number | null};

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
    this.claimService.getMyClaims().subscribe({
      next:  claims => { this.claims = claims; this.loading = false; },
      error: ()     => { this.loading = false; this.message.error('Erreur lors du chargement des réclamations'); }
    });
  }

  loadOrders(): void {
    this.clientService.getMyRecharges().subscribe({
      next: orders => { this.orders = orders; }
    });
  }

  showCreateModal(): void {
    this.isModalVisible = true;
    this.newClaim = {subject: '', description: '', orderId: null};
  }

  closeModal(): void { this.isModalVisible = false; }

  submitClaim(): void {
    if (!this.newClaim.subject.trim() || !this.newClaim.description.trim()) {
      this.message.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    // Append order info to subject if selected
    let finalSubject = this.newClaim.subject;
    if (this.newClaim.orderId) {
      finalSubject = `${finalSubject} (Commande #${this.newClaim.orderId})`;
    }

    this.submitting = true;
    this.claimService.createClaim({
      subject:     finalSubject,
      description: this.newClaim.description
    }).subscribe({
      next: claim => {
        this.claims.unshift(claim);
        this.isModalVisible = false;
        this.submitting     = false;
        this.message.success('✅ Réclamation soumise — notre équipe vous répondra sous 24h');
      },
      error: () => {
        this.submitting = false;
        this.message.error('Erreur lors de la soumission. Veuillez réessayer.');
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
