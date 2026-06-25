import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {TokenHelper} from '../helpers/token.helper';
import {TokenService} from '../services/token.service';
import {ROUTES} from '../constants/app.constants';

@Injectable({providedIn: 'root'})
export class AdminGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    const token = this.tokenService.getToken();
    if (token && !TokenHelper.isExpired(token) && TokenHelper.isAdmin(token)) {
      return true;
    }
    this.authService.logout();
    return this.router.createUrlTree([ROUTES.AUTH.LOGIN]);
  }
}
