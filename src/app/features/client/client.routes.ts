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
      {path: 'dashboard', component: DashboardComponent, title: 'Tableau de bord - Client - Charge Pay'},
      {path: 'store', component: StoreComponent, title: 'Boutique - Charge Pay'},
      {path: 'orders', component: OrdersComponent, title: 'Mes commandes - Charge Pay'},
      {path: 'history', component: HistoryComponent, title: 'Historique - Charge Pay'},
      {path: 'messaging', component: MessagingComponent, title: 'Messages - Charge Pay'},
      {path: 'claims', component: ClaimsComponent, title: 'Réclamations - Charge Pay'},
      {path: 'profile', component: ProfileComponent, title: 'Mon profil - Charge Pay'},
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'}
    ]
  }
];
