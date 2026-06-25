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
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {ConfirmModalComponent} from '../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-admin-operators',
  standalone: true,
  imports: [CommonModule, FormsModule, NzIconModule, NzToolTipModule, PageHeaderComponent, ConfirmModalComponent],
  templateUrl: './operators.component.html',
  styleUrl: './operators.component.scss'
})
export class OperatorsComponent implements OnInit, OnDestroy {
  operators: Operator[] = [];
  loading        = false;
  isModalVisible = false;
  submitting     = false;
  showConfirmDelete = false;
  opToDelete: Operator | null = null;
  deleting = false;
  newOperator: Partial<Operator> = {name: '', logoUrl: ''};

  private readonly destroy$ = new Subject<void>();
  private readonly opColors: Record<string, string> = {
    'ooredoo':          '#e3003e',
    'orange':           '#ff7900',
    'tunisie telecom':  '#003366'
  };

  constructor(
    private readonly operatorService: OperatorService,
    private readonly adminService: AdminService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void { this.loadOperators(); }

  loadOperators(): void {
    this.loading = true;
    this.operatorService.getAll()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:     (data) => { this.operators = data; },
        complete: ()     => { this.loading = false; },
        error:    ()     => { this.loading = false; this.message.error('Erreur lors du chargement des opérateurs'); }
      });
  }

  showCreateModal(): void {
    this.isModalVisible = true;
    this.newOperator    = {name: '', logoUrl: ''};
  }

  closeModal(): void { this.isModalVisible = false; }

  createOperator(): void {
    if (!this.newOperator.name?.trim()) {
      this.message.warning('Nom requis');
      return;
    }
    this.submitting = true;
    this.adminService.createOperator(this.newOperator)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('✅ Opérateur créé avec succès');
          this.isModalVisible = false;
          this.loadOperators();
        },
        error:    () => { this.message.error('Erreur lors de la création'); this.submitting = false; },
        complete: () => { this.submitting = false; }
      });
  }

  confirmDeleteOperator(op: Operator): void {
    this.opToDelete = op;
    this.showConfirmDelete = true;
  }

  deleteOperator(): void {
    if (!this.opToDelete) return;
    const name = this.opToDelete.name;
    this.deleting = true;
    this.adminService.deleteOperator(this.opToDelete.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success(`✅ Opérateur "${name}" supprimé avec succès`);
          this.showConfirmDelete = false;
          this.opToDelete = null;
          this.deleting = false;
          this.loadOperators();
        },
        error: () => {
          this.message.error(`Erreur lors de la suppression de "${name}"`);
          this.deleting = false;
        }
      });
  }

  getOpColor(name: string): string {
    const key = name?.toLowerCase();
    return this.opColors[key] || '#6C5CE7';
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        this.message.warning('L\'image ne doit pas dépasser 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.newOperator.logoUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
