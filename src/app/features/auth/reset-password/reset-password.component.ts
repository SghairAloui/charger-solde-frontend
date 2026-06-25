import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzResultModule} from 'ng-zorro-antd/result';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {AuthService} from '../../../core/services/auth.service';
import {ResetPasswordRequest} from '../../../core/models/reset-password-request.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    NzInputModule, NzButtonModule, NzResultModule, NzIconModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  loading = false;
  success = false;
  showNewPwd = false;
  showConfirmPwd = false;

  emailVal = '';
  codeVal = '';
  newPwdVal = '';
  confirmPwdVal = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly message: NzMessageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.emailVal = this.route.snapshot.queryParams['email'] || '';
    this.codeVal = this.route.snapshot.queryParams['code'] || '';
  }

  onSubmit(): void {
    const email = this.emailVal?.trim();
    const code = this.codeVal?.trim();
    const newPwd = this.newPwdVal;
    const confirmPwd = this.confirmPwdVal;

    if (!email) {
      this.message.warning('Veuillez saisir votre email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.message.warning('Email invalide');
      return;
    }
    if (!code || !/^[0-9]{6}$/.test(code)) {
      this.message.warning('Le code doit contenir exactement 6 chiffres');
      return;
    }
    if (!newPwd || newPwd.length < 8) {
      this.message.warning('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (newPwd !== confirmPwd) {
      this.message.warning('Les mots de passe ne correspondent pas');
      return;
    }

    this.loading = true;
    this.message.loading('Réinitialisation en cours...', {nzDuration: 0});

    const request: ResetPasswordRequest = {email, code, newPassword: newPwd, confirmPassword: confirmPwd};

    this.authService.resetPassword(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.remove();
          this.message.success('Mot de passe réinitialisé avec succès !');
          this.success = true;
        },
        error: (err) => {
          this.message.remove();
          this.message.error(err.error?.message || 'Code invalide ou expiré');
          this.loading = false;
        },
        complete: () => this.loading = false
      });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
