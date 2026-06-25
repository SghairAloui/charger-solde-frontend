import {HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {TokenService} from '../services/token.service';
import {TokenHelper} from '../helpers/token.helper';
import {ROUTES} from '../constants/app.constants';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const token = tokenService.getToken();

  if (token) {
    if (TokenHelper.isExpired(token)) {
      tokenService.clear();
      router.navigate([ROUTES.AUTH.LOGIN]);
      return next(req);
    }
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
