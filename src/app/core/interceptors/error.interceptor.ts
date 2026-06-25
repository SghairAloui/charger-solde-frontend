import {HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {TokenService} from '../services/token.service';
import {ROUTES} from '../constants/app.constants';
import {NzMessageService} from 'ng-zorro-antd/message';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  const isApiCall = req.url.startsWith('/api') || req.url.includes('localhost:8081');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 400:
          if (isApiCall) {
            message.error(error.error?.message || 'Requête invalide');
          }
          break;
        case 401:
          tokenService.clear();
          router.navigate([ROUTES.AUTH.LOGIN]);
          break;
        case 403:
          if (isApiCall) {
            message.error('Vous n\'êtes pas autorisé à effectuer cette action');
          } else {
            router.navigate([ROUTES.AUTH.LOGIN]);
          }
          break;
        case 404:
          if (isApiCall) {
            message.warning('Ressource introuvable');
          } else {
            router.navigate([ROUTES.AUTH.LOGIN]);
          }
          break;
        case 500:
          if (isApiCall) {
            message.error(error.error?.message || 'Erreur serveur');
          }
          break;
      }
      return throwError(() => error);
    })
  );
};
