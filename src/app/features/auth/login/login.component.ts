import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TokenHelper } from '../../../core/helpers/token.helper';
import { Role } from '../../../core/enums/role.enum';
import { LoginRequest } from '../../../core/models/login-request.model';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    NzFormModule, NzInputModule, NzButtonModule,
    NzCheckboxModule, NzIconModule, NzAlertModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  signupForm: FormGroup;

  loading = false;
  loginError = '';
  showPassword = false;
  mode: 'login' | 'signup' = 'login';

  // Barre de force du mot de passe
  passwordStrength = 0;
  strengthLabel = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly message: NzMessageService,
    private readonly notification: NzNotificationService,

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember: [false]
    });

    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      numTel: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, remember: true });
    }
  }

  // ── Toggle password visibility ────────────────────────
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ── Password strength meter ───────────────────────────
  onPasswordInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    let score = 0;

    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    this.passwordStrength = score;

    const labels: Record<number, string> = {
      1: 'Trop faible',
      2: 'Faible',
      3: 'Correct',
      4: 'Fort',
    };
    this.strengthLabel = labels[score] ?? '';
  }

  // ── Login ─────────────────────────────────────────────
  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.values(this.loginForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.notification.warning('Formulaire invalide', 'Veuillez vérifier vos informations');
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
          if (this.loginForm.value.remember) {
            localStorage.setItem('rememberedEmail', this.loginForm.value.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }


          const role = TokenHelper.getRole(response.data.token);
          const target = role === Role.ADMIN ? '/admin/dashboard' : '/client/dashboard';
          this.router.navigate([target]);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  // ── Signup ────────────────────────────────────────────
  onSignup(): void {
    if (this.signupForm.invalid) {
      Object.values(this.signupForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.notification.warning('Formulaire invalide', 'Veuillez remplir tous les champs requis');
      return;
    }

    this.loading = true;

    this.authService.signup(this.signupForm.value).subscribe({
      next: () => {
        this.notification.success(
          'Demande envoyée',
          'Votre compte est en attente de validation par un administrateur'
        );
        this.mode = 'login';
        this.signupForm.reset();
        this.passwordStrength = 0;
        this.strengthLabel = '';
        this.loading = false;
      },
      error: () => {
        this.notification.error('Erreur', 'Impossible de créer le compte. Veuillez réessayer.');
        this.loading = false;
      }
    });
  }

  // ── Helpers ───────────────────────────────────────────
  switchToSignup(): void { this.mode = 'signup'; this.loginError = ''; }
  switchToLogin(): void { this.mode = 'login'; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
