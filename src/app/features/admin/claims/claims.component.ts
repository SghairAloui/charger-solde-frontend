import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';
import {ClaimService, ClaimDTO, ClaimStatus} from '../../../core/services/claim.service';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-admin-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, PageHeaderComponent, DateFormatPipe],
  templateUrl: './claims.component.html',
  styleUrl: './claims.component.scss'
})
export class ClaimsComponent implements OnInit, OnDestroy {
  claims: ClaimDTO[] = [];
  loading        = true;
  isModalVisible = false;
  submitting     = false;
  selectedStatus: ClaimStatus = 'IN_PROGRESS';
  selectedClaim: ClaimDTO | null = null;
  responseText = '';
  errorMsg = '';
  private readonly destroy$ = new Subject<void>();

  get openCount(): number {
    return this.claims.filter(c => c.status === 'PENDING').length;
  }

  constructor(
    private readonly claimService: ClaimService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    this.loading = true;
    this.errorMsg = '';
    this.claimService.getAllClaims()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  claims => { this.claims = claims; this.loading = false; },
        error: () => { this.errorMsg = 'Impossible de charger les réclamations'; this.loading = false; this.message.error('Erreur lors du chargement des réclamations'); }
      });
  }

  openStatusModal(claim: ClaimDTO): void {
    this.selectedClaim  = claim;
    this.selectedStatus = 'IN_PROGRESS';
    this.responseText   = claim.adminResponse || '';
    this.isModalVisible = true;
  }

  closeModal(): void { this.isModalVisible = false; }

  submitStatusUpdate(): void {
    if (!this.selectedClaim) return;
    this.submitting = true;
    this.claimService.updateStatus(this.selectedClaim.id, this.selectedStatus, this.responseText)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updated => {
          const idx = this.claims.findIndex(c => c.id === updated.id);
          if (idx >= 0) this.claims[idx] = updated;
          this.isModalVisible = false;
          this.submitting = false;
          this.message.success('✅ Statut de la réclamation mis à jour');
        },
        error: () => {
          this.submitting = false;
          this.message.error('Erreur lors de la mise à jour du statut');
        }
      });
  }

  resolveClaim(claim: ClaimDTO): void {
    this.claimService.updateStatus(claim.id, 'RESOLVED', 'Résolu par l\'administrateur')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: updated => {
          const idx = this.claims.findIndex(c => c.id === updated.id);
          if (idx >= 0) this.claims[idx] = updated;
          this.message.success('✅ Réclamation marquée comme résolue');
        },
        error: () => this.message.error('Erreur lors de la résolution')
      });
  }

  getStatusLabel(status: ClaimStatus): string {
    const map: Record<ClaimStatus, string> = {
      PENDING: 'En attente', IN_PROGRESS: 'En cours',
      RESOLVED: 'Résolu', REJECTED: 'Rejeté'
    };
    return map[status] || status;
  }

  getStatusClass(status: ClaimStatus): string {
    const map: Record<ClaimStatus, string> = {
      PENDING: 'status--warning', IN_PROGRESS: 'status--info',
      RESOLVED: 'status--success', REJECTED: 'status--danger'
    };
    return map[status] || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
