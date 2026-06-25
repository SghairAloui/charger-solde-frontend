import {Component, OnDestroy, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {NzIconModule} from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NzIconModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss'
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  stats = { clients: 0, recharges: 0, uptime: 0 };
  private readonly targetStats = { clients: 1200, recharges: 48500, uptime: 99 };
  private timer: any;

  features = [
    { icon: 'thunderbolt', title: 'Recharge instantanée', desc: 'Créditez un numéro en moins de 60 secondes', color: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' },
    { icon: 'bell', title: 'Notifications temps réel', desc: 'Suivi en direct de chaque transaction', color: 'linear-gradient(135deg, #00CEC9, #81ecec)' },
    { icon: 'safety-certificate', title: 'Sécurité renforcée', desc: 'Authentification JWT + chiffrement SSL', color: 'linear-gradient(135deg, #00b894, #55efc4)' },
    { icon: 'bar-chart', title: 'Tableau de bord avancé', desc: 'Analytiques et rapports détaillés', color: 'linear-gradient(135deg, #fdcb6e, #e17055)' }
  ];

  ngOnInit(): void {
    this.animateCounters();
  }

  private animateCounters(): void {
    const duration = 2000;
    const steps    = 60;
    const interval = duration / steps;
    let step = 0;

    this.timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);

      this.stats.clients   = Math.round(this.targetStats.clients   * ease);
      this.stats.recharges = Math.round(this.targetStats.recharges * ease);
      this.stats.uptime    = Math.round(this.targetStats.uptime    * ease);

      if (step >= steps) clearInterval(this.timer);
    }, interval);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
