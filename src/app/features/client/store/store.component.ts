import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';
import { OperatorService } from '../../../core/services/operator.service';
import { ClientService } from '../../../core/services/client.service';
import { Operator } from '../../../core/models/operator.model';
import { RechargePlan } from '../../../core/models/recharge-plan.model';
import { CreateRechargeRequestDTO } from '../../../core/models/create-recharge-request.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PhoneFormatPipe } from '../../../shared/pipes/phone-format.pipe';

@Component({
  selector: 'app-client-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NzIconModule, PageHeaderComponent, PhoneFormatPipe],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss'
})
export class StoreComponent implements OnInit, OnDestroy {
  operators: Operator[] = [];
  plans: RechargePlan[] = [];
  selectedOperator: Operator | null = null;
  selectedPlan: RechargePlan | null = null;
  phoneNumber = '';
  phoneError = '';
  currentStep = 0;
  submitting = false;

  readonly steps = ['Opérateur', 'Offre', 'Téléphone', 'Succès'];

  private readonly destroy$ = new Subject<void>();
  private readonly opColors: Record<string, string> = {
    'ooredoo': '#e3003e', 'orange': '#ff7900',
    'tunisie telecom': '#003366', 'tt': '#74b9ff'
  };

  constructor(
    private readonly operatorService: OperatorService,
    private readonly clientService: ClientService,
    private readonly message: NzMessageService
  ) { }

  ngOnInit(): void {
    this.operatorService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => { this.operators = data; });
  }

  selectOperator(op: Operator): void {
    this.selectedOperator = op;
    this.operatorService.getPlans(op.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.plans = data;
          this.currentStep = 1;
        },
        error: () => this.message.error('Erreur lors du chargement des offres')
      });
  }

  selectPlan(plan: RechargePlan): void {
    this.selectedPlan = plan;
    this.currentStep = 2;
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Strip everything except digits
    this.phoneNumber = input.value.replace(/\D/g, '').substring(0, 8);
    this.validatePhone();
  }

  validatePhone(): void {
    if (this.phoneNumber && this.phoneNumber.length !== 8) {
      this.phoneError = 'Le numéro doit contenir exactement 8 chiffres';
    } else {
      this.phoneError = '';
    }
  }

  confirmOrder(): void {
    if (!this.selectedPlan || !this.phoneNumber) return;
    this.validatePhone();
    if (this.phoneError) return;
    this.submitting = true;
    const dto: CreateRechargeRequestDTO = {
      phoneNumber: this.phoneNumber,
      planId: this.selectedPlan.id,
      amount: this.selectedPlan.price
    };
    this.clientService.createRecharge(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.currentStep = 3;
          this.message.success('✅ Demande de recharge créée avec succès');
        }, error: () => { this.message.error('Erreur lors de la création'); this.submitting = false; },
        complete: () => { this.submitting = false; }
      });
  }

  resetStore(): void {
    this.selectedOperator = null;
    this.selectedPlan = null;
    this.phoneNumber = '';
    this.currentStep = 0;
  }

  getOpColor(name?: string): string {
    if (!name) return '#6C5CE7';
    return this.opColors[name.toLowerCase()] || '#6C5CE7';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
