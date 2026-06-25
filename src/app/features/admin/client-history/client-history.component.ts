import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {AdminService, ClientRechargeSummary} from '../../../core/services/admin.service';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {StatusLabelPipe} from '../../../shared/pipes/status-label.pipe';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    NzIconModule, NzToolTipModule,
    PageHeaderComponent, StatusLabelPipe, DateFormatPipe
  ],
  templateUrl: './client-history.component.html',
  styleUrl: './client-history.component.scss'
})
export class ClientHistoryComponent implements OnInit, OnDestroy {
  clients: ClientRechargeSummary[] = [];
  filteredClients: ClientRechargeSummary[] = [];
  loading = false;
  searchTerm = '';
  statusFilter: 'ALL' | 'PENDING' | 'VALIDATED' | 'REJECTED' = 'ALL';

  private readonly destroy$ = new Subject<void>();
  private readonly avatarColors = ['#6C5CE7','#00CEC9','#e17055','#00b894','#fdcb6e','#74b9ff','#a29bfe','#fd79a8'];

  constructor(
    private readonly adminService: AdminService,
    private readonly message: NzMessageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.adminService.getClientRechargeSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clients = data;
          this.applyFilters();
          this.loading = false;
        },
        error: () => {
          this.message.error('Erreur lors du chargement de l\'historique');
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  setFilter(filter: 'ALL' | 'PENDING' | 'VALIDATED' | 'REJECTED'): void {
    this.statusFilter = filter;
    this.applyFilters();
  }

  private applyFilters(): void {
    let result = [...this.clients];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.nom.toLowerCase().includes(term) ||
        c.prenom.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
      );
    }

    this.filteredClients = result;
  }

  getPendingTotal(): number {
    return this.clients.reduce((sum, c) => sum + c.pendingCount, 0);
  }

  getAvatarColor(name: string): string {
    if (!name) return this.avatarColors[0];
    return this.avatarColors[name.charCodeAt(0) % this.avatarColors.length];
  }

  viewClientDetail(client: ClientRechargeSummary): void {
    this.router.navigate(['/admin/orders'], {queryParams: {client: client.email}});
  }

  refresh(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
