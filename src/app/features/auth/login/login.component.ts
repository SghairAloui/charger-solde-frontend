import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzAlertModule} from 'ng-zorro-antd/alert';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {AuthService} from '../../../core/services/auth.service';
import {TokenHelper} from '../../../core/helpers/token.helper';
import {Role} from '../../../core/enums/role.enum';
import {LoginRequest} from '../../../core/models/login-request.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    NzFormModule, NzInputModule, NzButtonModule, NzCheckboxModule, NzIconModule, NzAlertModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  loading     = false;
  loginError  = '';
  showPassword = false;
  private readonly destroy$ = new Subject<void>();
  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly message: NzMessageService,
      private readonly notification: NzNotificationService

  ) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });
  }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({email: savedEmail, remember: true});
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

onSubmit(): void {
  if (this.loginForm.invalid) {
    Object.values(this.loginForm.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });

    this.notification.warning(
      'Formulaire invalide',
      'Veuillez vérifier vos informations'
    );

    return;
  }

  this.loading = true;
  this.loginError = '';

  const request: LoginRequest = {
    email: this.loginForm.value.email,
    password: this.loginForm.value.password
  };

  this.authService.login(request)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {

        // Remember email
        if (this.loginForm.value.remember) {
          localStorage.setItem('rememberedEmail', this.loginForm.value.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // SUCCESS TOAST
        this.notification.success(
          'Connexion réussie',
          'Bienvenue 👋'
        );

        const role = TokenHelper.getRole(response.data.token);
        const target = role === Role.ADMIN
          ? '/admin/dashboard'
          : '/client/dashboard';

        this.router.navigate([target]);

        this.loading = false;
      },

      error: () => {
        // ERROR TOAST
        this.notification.error(
          'Connexion échouée',
          'Email ou mot de passe incorrect'
        );

        this.loading = false;
      }
    });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
