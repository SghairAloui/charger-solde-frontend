import {Routes} from '@angular/router';
import {AuthLayoutComponent} from '../../shared/layouts/auth-layout/auth-layout.component';
import {LoginComponent} from './login/login.component';
import {ForgotPasswordComponent} from './forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {path: 'login', component: LoginComponent, title: 'Connexion - WAHA NET'},
      {path: 'forgot-password', component: ForgotPasswordComponent, title: 'Mot de passe oublié - WAHA NET'},
      {path: 'reset-password', component: ResetPasswordComponent, title: 'Réinitialiser le mot de passe - WAHA NET'},
      {path: '', redirectTo: 'login', pathMatch: 'full'}
    ]
  }
];

