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
      {path: 'login', component: LoginComponent, title: 'Connexion - Charge Pay'},
      {path: 'forgot-password', component: ForgotPasswordComponent, title: 'Mot de passe oublié - Charge Pay'},
      {path: 'reset-password', component: ResetPasswordComponent, title: 'Réinitialiser le mot de passe - Charge Pay'},
      {path: '', redirectTo: 'login', pathMatch: 'full'}
    ]
  }
];
