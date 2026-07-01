import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { NzMessageService } from 'ng-zorro-antd/message';

import { NzIconModule } from 'ng-zorro-antd/icon';

import { AdminService, SystemAlert } from '../../../core/services/admin.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';


@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    NzIconModule, PageHeaderComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent implements OnInit {

  title = '';

  message = '';

  loading = false;


  alerts: SystemAlert[] = [];

  constructor(
    private adminService: AdminService,
    private msg: NzMessageService
  ) { }


  ngOnInit(): void {

    this.loadAlerts();

  }

  loadAlerts() {


    this.adminService
      .getAlerts()
      .subscribe({

        next: (data) => {

          this.alerts = data;

        },

        error: () => {

          this.msg.error(
            'Impossible de charger les alertes'
          );

        }

      })


  }







  sendAlert() {


    if (
      !this.title.trim()
      ||
      !this.message.trim()
    ) {

      this.msg.warning(
        'Veuillez remplir tous les champs'
      );

      return;
    }




    this.loading = true;



    this.adminService
      .createAlert({

        title: this.title,

        message: this.message

      })
      .subscribe({

        next: () => {


          this.msg.success(
            'Alerte envoyée aux clients'
          );



          this.title = '';

          this.message = '';


          this.loading = false;


          this.loadAlerts();


        },


        error: () => {


          this.msg.error(
            'Erreur lors de l’envoi'
          );


          this.loading = false;

        }


      })



  }







  disableAlert(id: number) {



    this.adminService
      .disableAlert(id)
      .subscribe({

        next: () => {


          this.msg.success(
            'Alerte désactivée'
          );


          this.loadAlerts();


        },

        error: () => {

          this.msg.error(
            'Erreur'
          );

        }

      })


  }

}
