import {Routes} from '@angular/router';
import {ClientLayoutComponent} from '../../shared/layouts/client-layout/client-layout.component';
import {ClientGuard} from '../../core/guards/client.guard';
import {DashboardComponent} from './dashboard/dashboard.component';
import {StoreComponent} from './store/store.component';
import {OrdersComponent} from './orders/orders.component';
import {HistoryComponent} from './history/history.component';
import {MessagingComponent} from './messaging/messaging.component';
import {ClaimsComponent} from './claims/claims.component';
import {ProfileComponent} from './profile/profile.component';

export const clientRoutes: Routes = [
  {
    path: '',
    component: ClientLayoutComponent,
    canActivate: [ClientGuard],
    children: [
      {path: 'dashboard', component: DashboardComponent, title: 'Tableau de bord - Client - Rassidi'},
      {path: 'store', component: StoreComponent, title: 'Boutique - Rassidi'},
      {path: 'orders', component: OrdersComponent, title: 'Mes commandes - Rassidi'},
      {path: 'history', component: HistoryComponent, title: 'Historique - Rassidi'},
      {path: 'messaging', component: MessagingComponent, title: 'Messages - Rassidi'},
      {path: 'claims', component: ClaimsComponent, title: 'Réclamations - Rassidi'},
      {path: 'profile', component: ProfileComponent, title: 'Mon profil - Rassidi'},
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'}
    ]
  }
];
