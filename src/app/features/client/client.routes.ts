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
      {path: 'dashboard', component: DashboardComponent, title: 'Tableau de bord - Client - WAHA NET'},
      {path: 'store', component: StoreComponent, title: 'Boutique - WAHA NET'},
      {path: 'orders', component: OrdersComponent, title: 'Mes commandes - WAHA NET'},
      {path: 'history', component: HistoryComponent, title: 'Historique - WAHA NET'},
      {path: 'messaging', component: MessagingComponent, title: 'Messages - WAHA NET'},
      {path: 'claims', component: ClaimsComponent, title: 'Réclamations - WAHA NET'},
      {path: 'profile', component: ProfileComponent, title: 'Mon profil - WAHA NET'},
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'}
    ]
  }
];
