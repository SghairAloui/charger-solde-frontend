import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap} from 'rxjs';
import {environment} from '../../../environments/environment';
import {API} from '../constants/app.constants';
import {ApiResponse} from '../models/api-response.model';
import {LoginRequest} from '../models/login-request.model';
import {LoginResponse} from '../models/login-response.model';
import {ForgotPasswordRequest} from '../models/forgot-password-request.model';
import {ResetPasswordRequest} from '../models/reset-password-request.model';
import {TokenService} from './token.service';
import {User} from '../models/user.model';

@Injectable({providedIn: 'root'})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService
  ) {}

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.apiUrl}${API.AUTH.LOGIN}`, request)
      .pipe(
        tap(response => {
          this.tokenService.setToken(response.data.token);
          const user: User = {
            id: response.data.id,
            nom: response.data.nom,
            prenom: response.data.prenom,
            email: response.data.email,
            role: response.data.role,
            numTel: '',
            photoUrl: response.data.photoUrl ? (this.apiUrl.replace('/api', '') + response.data.photoUrl) : '',
            active: true,
            createdAt: new Date()
          };
          this.tokenService.setUser(user);
        })
      );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}${API.AUTH.FORGOT_PASSWORD}`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}${API.AUTH.RESET_PASSWORD}`, request);
  }

  validateResetCode(email: string, code: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}${API.AUTH.VALIDATE_RESET_CODE}`, null, {
      params: {email, code}
    });
  }

  logout(): void {
    this.tokenService.clear();
  }

  isLoggedIn(): boolean {
    return this.tokenService.hasToken();
  }

  getCurrentUser(): User | null {
    return this.tokenService.getUser();
  }
}
