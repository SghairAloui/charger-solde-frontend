import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzToolTipModule} from 'ng-zorro-antd/tooltip';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {AdminService} from '../../../core/services/admin.service';
import {User} from '../../../core/models/user.model';
import {CreateClientRequest} from '../../../core/models/create-client-request.model';
import {PageHeaderComponent} from '../../../shared/components/page-header/page-header.component';
import {DateFormatPipe} from '../../../shared/pipes/date-format.pipe';
import {ROUTES} from '../../../core/constants/app.constants';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    NzIconModule, NzToolTipModule,
    PageHeaderComponent, DateFormatPipe
  ],
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss'
})
export class ClientsComponent implements OnInit, OnDestroy {
  clients:         User[] = [];
  filteredClients: User[] = [];
  loading     = false;
  searchTerm  = '';
  isModalVisible = false;
  submitting     = false;
  submitted      = false;
  showNewPwd     = false;

  newClient: CreateClientRequest = {nom: '', prenom: '', email: '', numTel: '', password: ''};

  private readonly destroy$ = new Subject<void>();
  private readonly colors = [
    '#6C5CE7','#00CEC9','#e17055','#00b894','#fdcb6e','#74b9ff','#a29bfe','#fd79a8'
  ];

  get activeCount():    number { return this.clients.filter(c => c.active).length; }
  get suspendedCount(): number { return this.clients.filter(c => !c.active).length; }

  constructor(
    private readonly adminService: AdminService,
    private readonly message: NzMessageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void { this.loadClients(); }

  loadClients(): void {
    this.loading = true;
    this.adminService.getClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clients         = data;
          this.filteredClients = data;
          this.loading         = false;
        },
        error: () => { this.loading = false; }
      });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredClients = term
      ? this.clients.filter(c =>
          c.nom.toLowerCase().includes(term)     ||
          c.prenom.toLowerCase().includes(term)  ||
          c.email.toLowerCase().includes(term))
      : [...this.clients];
  }

  clearSearch(): void {
    this.searchTerm      = '';
    this.filteredClients = [...this.clients];
  }

  showCreateModal(): void {
    this.isModalVisible = true;
    this.submitted      = false;
    this.newClient      = {nom: '', prenom: '', email: '', numTel: '', password: ''};
  }

  closeModal(): void {
    if (!this.submitting) {
      this.isModalVisible = false;
      this.submitted      = false;
    }
  }

  createClient(): void {
    this.submitted = true;
    if (!this.newClient.nom || !this.newClient.prenom ||
        !this.newClient.email || !this.newClient.password) {
      this.message.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.submitting = true;
    this.adminService.createClient(this.newClient)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('✅ Client créé ! Un email avec les identifiants a été envoyé.');
          this.isModalVisible = false;
          this.submitted      = false;
          this.loadClients();
        },
        error: (err) => {
          const msg = err?.error?.message || 'Erreur lors de la création';
          this.message.error(msg);
          this.submitting = false;
        },
        complete: () => { this.submitting = false; }
      });
  }

  toggleStatus(client: User): void {
    const action = client.active ? 'Suspendre' : 'Activer';
    this.adminService.toggleClientStatus(client.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          // Update the client in the list
          const idx = this.clients.findIndex(c => c.id === client.id);
          if (idx >= 0) {
            this.clients[idx] = {...this.clients[idx], active: updated.active};
          }
          this.onSearch();
          this.message.success(`${action} : ${client.prenom} ${client.nom}`);
        },
        error: () => {
          this.message.error(`Erreur lors de la ${action.toLowerCase()} du client`);
        }
      });
  }

  sendMessage(client: User): void {
    this.router.navigate([`/${ROUTES.ADMIN.ROOT}/${ROUTES.ADMIN.MESSAGING}`], {
      queryParams: {clientId: client.id}
    });
  }

  getColor(name: string): string {
    if (!name) return this.colors[0];
    return this.colors[name.charCodeAt(0) % this.colors.length];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
