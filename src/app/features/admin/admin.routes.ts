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
import { AlertComponent } from './alert/alert.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      {path: 'dashboard', component: DashboardComponent, title: 'Tableau de bord - Admin - WAHA NET'},
      {path: 'profile', component: ProfileComponent, title: 'Mon profil - Admin - WAHA NET'},
      {path: 'clients', component: ClientsComponent, title: 'Clients - Admin - WAHA NET'},
      {path: 'operators', component: OperatorsComponent, title: 'Opérateurs - Admin - WAHA NET'},
      {path: 'offers', component: OffersComponent, title: 'Offres - Admin - WAHA NET'},
      {path: 'orders', component: OrdersComponent, title: 'Commandes - Admin - WAHA NET'},
      {path: 'notifications', component: NotificationsComponent, title: 'Notifications - Admin - WAHA NET'},
      {path: 'messaging', component: MessagingComponent, title: 'Messagerie - Admin - WAHA NET'},
      {path: 'claims', component: ClaimsComponent, title: 'Réclamations - Admin - WAHA NET'},
      {path: 'client-history', component: ClientHistoryComponent, title: 'Historique recharges - Admin - WAHA NET'},
      {path: 'alert', component: AlertComponent, title: 'Alert - Admin - WAHA NET'},

      {path: '', redirectTo: 'dashboard', pathMatch: 'full'}
    ]
  }
];
