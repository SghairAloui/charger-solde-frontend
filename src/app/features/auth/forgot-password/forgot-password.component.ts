import {Component, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzResultModule} from 'ng-zorro-antd/result';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subject, takeUntil} from 'rxjs';
import {AuthService} from '../../../core/services/auth.service';
import {ForgotPasswordRequest} from '../../../core/models/forgot-password-request.model';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    NzFormModule, NzInputModule, NzButtonModule, NzResultModule, NzIconModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnDestroy {
  forgotForm: FormGroup;
  loading = false;
  emailSent = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly message: NzMessageService
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) return;

    this.loading = true;
    const request: ForgotPasswordRequest = this.forgotForm.value;

    this.authService.forgotPassword(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.emailSent = true;
        },
        error: (err) => {
          this.message.error(err.error?.message || 'Erreur lors de l\'envoi du lien');
          this.loading = false;
        },
        complete: () => this.loading = false
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
