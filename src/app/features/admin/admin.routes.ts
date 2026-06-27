import {Routes} from '@angular/router';
import {AdminLayoutComponent} from '../../shared/layouts/admin-layout/admin-layout.component';
import {AdminGuard} from '../../core/guards/admin.guard';
import {DashboardComponent} from './dashboard/dashboard.component';
import {ClientsComponent} from './clients/clients.component';
import {OperatorsComponent} from './operators/operators.component';
import {OffersComponent} from './offers/offers.component';
import {OrdersComponent} from './orders/orders.component';
import {NotificationsComponent} from './notifications/notifications.component';
import {MessagingComponent} from './messaging/messaging.component';
import {ClaimsComponent} from './claims/claims.component';
import {ClientHistoryComponent} from './client-history/client-history.component';
import {ProfileComponent} from '../client/profile/profile.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {path: 'dashboard', component: DashboardComponent, title: 'Tableau de bord - Admin - Rassidi'},
      {path: 'profile', component: ProfileComponent, title: 'Mon profil - Admin - Rassidi'},
      {path: 'clients', component: ClientsComponent, title: 'Clients - Admin - Rassidi'},
      {path: 'operators', component: OperatorsComponent, title: 'Opérateurs - Admin - Rassidi'},
      {path: 'offers', component: OffersComponent, title: 'Offres - Admin - Rassidi'},
      {path: 'orders', component: OrdersComponent, title: 'Commandes - Admin - Rassidi'},
      {path: 'notifications', component: NotificationsComponent, title: 'Notifications - Admin - Rassidi'},
      {path: 'messaging', component: MessagingComponent, title: 'Messagerie - Admin - Rassidi'},
      {path: 'claims', component: ClaimsComponent, title: 'Réclamations - Admin - Rassidi'},
      {path: 'client-history', component: ClientHistoryComponent, title: 'Historique recharges - Admin - Rassidi'},
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'}
    ]
  }
];
