import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {AdminService} from '../../../core/services/admin.service';
import {OperatorService} from '../../../core/services/operator.service';
import {Operator} from '../../../core/models/operator.model';
import {RechargePlan} from '../../../core/models/recharge-plan.model';
import {RechargePlanDTO} from '../../../core/models/recharge-plan-dto.model';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {ConfirmModalComponent} from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-admin-offers',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, NzToolTipModule, PageHeaderComponent, ConfirmModalComponent],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.scss'
})
export class OffersComponent implements OnInit, OnDestroy {
  offers:    RechargePlan[] = [];
  operators: Operator[]     = [];
  loading        = false;
  isModalVisible = false;
  isEditMode     = false;
  editOfferId: number | null = null;
  submitting     = false;
  showConfirmDelete = false;
  offerToDelete: RechargePlan | null = null;
  deleting = false;
  offerForm: RechargePlanDTO = {label: '', price: 0, validityDays: 30, operatorId: 0};

  private readonly destroy$ = new Subject<void>();
  private readonly opColors: Record<string, string> = {
    'ooredoo': '#e3003e', 'orange': '#ff7900',
    'tunisie telecom': '#003366', 'tt': '#003366'
  };

  constructor(
    private readonly adminService: AdminService,
    private readonly operatorService: OperatorService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    this.offers  = [];

    this.operatorService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ops => {
          this.operators = ops;
          let pending = ops.length;
          if (pending === 0) { this.loading = false; return; }
          ops.forEach(op => {
            this.operatorService.getPlans(op.id)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: plans => { this.offers = [...this.offers, ...plans]; },
                complete: () => { if (--pending === 0) this.loading = false; },
                error: () => { if (--pending === 0) this.loading = false; this.message.error('Erreur lors du chargement des offres'); }
              });
          });
        },
        error: () => { this.loading = false; this.message.error('Erreur lors du chargement des opérateurs'); }
      });
  }

  showCreateModal(): void {
    this.isEditMode  = false;
    this.editOfferId = null;
    this.offerForm   = {label: '', price: 0, validityDays: 30, operatorId: 0};
    this.isModalVisible = true;
  }

  showEditModal(offer: RechargePlan): void {
    this.isEditMode  = true;
    this.editOfferId = offer.id;
    this.offerForm   = {
      label: offer.label,
      price: offer.price,
      validityDays: offer.validityDays,
      operatorId: offer.operator?.id || 0
    };
    this.isModalVisible = true;
  }

  closeModal(): void { this.isModalVisible = false; }

  submitOffer(): void {
    if (!this.offerForm.label?.trim() || !this.offerForm.operatorId) {
      this.message.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.submitting = true;

    if (this.isEditMode && this.editOfferId) {
      this.adminService.updatePlan(this.editOfferId, this.offerForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.message.success('✅ Offre modifiée avec succès');
            this.isModalVisible = false;
            this.loadData();
          },
          error: () => { this.message.error('Erreur lors de la modification'); this.submitting = false; },
          complete: () => { this.submitting = false; }
        });
    } else {
      this.adminService.createPlan(this.offerForm)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.message.success('✅ Offre créée avec succès');
            this.isModalVisible = false;
            this.loadData();
          },
          error: () => { this.message.error('Erreur lors de la création'); this.submitting = false; },
          complete: () => { this.submitting = false; }
        });
    }
  }

  confirmDeleteOffer(offer: RechargePlan): void {
    this.offerToDelete = offer;
    this.showConfirmDelete = true;
  }

  deleteOffer(): void {
    if (!this.offerToDelete) return;
    const label = this.offerToDelete.label;
    this.deleting = true;
    this.adminService.deletePlan(this.offerToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success(`✅ Offre "${label}" supprimée avec succès`);
          this.showConfirmDelete = false;
          this.offerToDelete = null;
          this.deleting = false;
          this.loadData();
        },
        error: () => {
          this.message.error(`Erreur lors de la suppression de "${label}"`);
          this.deleting = false;
        }
      });
  }

  getOpColor(name?: string): string {
    if (!name) return '#6C5CE7';
    return this.opColors[name.toLowerCase()] || '#6C5CE7';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleOfferStatus(offer: RechargePlan): void {
  const action = offer.active ? 'block' : 'unblock';

  this.adminService.togglePlanStatus(offer.id, action)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        offer.active = !offer.active;

        this.message.success(
          offer.active
            ? 'Offre activée'
            : 'Offre bloquée'
        );
      },
      error: () => {
        this.message.error('Erreur lors du changement de statut');
      }
    });
}
}
