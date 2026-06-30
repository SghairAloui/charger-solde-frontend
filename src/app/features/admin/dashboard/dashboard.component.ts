import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';

import {
  AdminService,
  ClientRechargeSummary
} from '../../../core/services/admin.service';

import { AdminDashboard } from '../../../core/models/admin-dashboard.model';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RechargeRequest } from '../../../core/models/recharge-request.model';
import { StatusLabelPipe } from '../../../shared/pipes/status-label.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NzIconModule,
    NzToolTipModule,
    StatCardComponent,
    PageHeaderComponent,
    StatusLabelPipe,
    DateFormatPipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  stats: AdminDashboard | null = null;

  recentRecharges: RechargeRequest[] = [];

  clientSummaries: ClientRechargeSummary[] = [];

  loading = false;

  pendingCount = 0;

  today = new Date();


  greeting = {
    emoji: '☀️',
    text: 'Bonjour'
  };


  currentPage = 0;
  pageSize = 10;
  totalPages = 0;


  private readonly destroy$ = new Subject<void>();


  private readonly avatarColors = [
    '#6C5CE7',
    '#00CEC9',
    '#e17055',
    '#00b894',
    '#fdcb6e',
    '#74b9ff'
  ];


  constructor(
    private readonly adminService: AdminService,
    private readonly message: NzMessageService
  ) { }


  ngOnInit(): void {
    this.loadData();
  }



  loadData(): void {

    this.loading = true;


    // dashboard
    this.adminService.getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.stats = data;
        }
      });



    // commandes
    this.adminService.getRechargeRequests(this.currentPage)
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: res => {

          this.recentRecharges = res.content;

          this.totalPages = res.totalPages;


          this.pendingCount =
            this.recentRecharges
              .filter(r => r.status === 'PENDING')
              .length;


          // recalcul rejected + cancelled
          this.mergeRejectedCounts();

        },


        error: () => {
          this.message.error('Erreur recharges');
        },


        complete: () => {
          this.loading = false;
        }

      });



    // clients
    this.adminService.getClientRechargeSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {

        this.clientSummaries = data;


        // après chargement clients
        this.mergeRejectedCounts();

      });

  }



  /**
   * Ajoute ADMIN_CANCELLED dans rejected
   */
  private mergeRejectedCounts(): void {


    if (!this.clientSummaries.length ||
      !this.recentRecharges.length) {
      return;
    }


    this.clientSummaries =
      this.clientSummaries.map(client => {


        const cancelled =
          this.recentRecharges.filter(r =>
            r.client?.id === client.clientId &&
            r.status === 'ADMIN_CANCELLED'
          ).length;



        return {

          ...client,

          rejectedCount:
            (client.rejectedCount || 0) + cancelled

        };

      });

  }




  nextPage(): void {

    if (this.currentPage < this.totalPages - 1) {

      this.currentPage++;

      this.loadData();

    }

  }



  prevPage(): void {

    if (this.currentPage > 0) {

      this.currentPage--;

      this.loadData();

    }

  }



  refresh(): void {

    this.loadData();

  }




  validate(id: number, accept: boolean): void {


    this.adminService.validateRecharge(id, accept)
      .pipe(takeUntil(this.destroy$))
      .subscribe({

        next: () => {

          this.message.success(
            accept ?
              'Recharge validée' :
              'Recharge rejetée'
          );

          this.loadData();

        },


        error: () => {

          this.message.error(
            'Erreur validation'
          );

        }

      });

  }




  getAvatarColor(name: string): string {

    if (!name)
      return this.avatarColors[0];


    return this.avatarColors[
      name.charCodeAt(0) % this.avatarColors.length
    ];

  }



  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();

  }

}