import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzMessageService} from 'ng-zorro-antd/message';
import {NzTabsModule} from 'ng-zorro-antd/tabs';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {Subject, takeUntil} from 'rxjs';
import {ProfileService} from '../../../core/services/profile.service';
import {ProfileResponse} from '../../../core/models/profile.model';
import {environment} from '../../../../environments/environment';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzIconModule, NzTabsModule,
    NzFormModule, NzInputModule, NzButtonModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit, OnDestroy {
  profile: ProfileResponse | null = null;
  
  profileForm: FormGroup;
  passwordForm: FormGroup;

  saving = false;
  savingPassword = false;
  showOldPwd = false;
  showNewPwd = false;
  showConfirmPwd = false;

  activeTab: 'info' | 'security' = 'info';

  avatarPreview: string | null = null;

  private readonly destroy$ = new Subject<void>();
  private readonly avatarColors = ['#6C5CE7', '#00CEC9', '#e17055', '#00b894', '#fdcb6e'];
  uploadingAvatar = false;

  get pwdStrength(): number {
    const pwd = this.passwordForm.get('newPassword')?.value;
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9!@#$%^&*]/.test(pwd)) score++;
    return score;
  }

  get pwdStrengthLabel(): string {
    const labels = ['', 'Faible', 'Moyen', 'Fort'];
    return labels[this.pwdStrength] || '';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly message: NzMessageService
  ) {
    this.profileForm = this.fb.group({
      prenom: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      email: [{value: '', disabled: true}],
      numTel: ['', [Validators.pattern('^[0-9]{8}$')]]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private readonly backendUrl = environment.apiUrl.replace('/api', '');

  getPhotoUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return this.backendUrl + path;
  }

  ngOnInit(): void {
    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.profile = data;
          this.avatarPreview = this.getPhotoUrl(data.photoUrl);
          this.profileForm.patchValue({
            prenom: data.prenom,
            nom: data.nom,
            email: data.email,
            numTel: data.numTel
          });
        },
        error: () => this.message.error('Erreur lors du chargement du profil')
      });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      Object.values(this.profileForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.saving = true;
    const req = {
      prenom: this.profileForm.get('prenom')?.value,
      nom: this.profileForm.get('nom')?.value,
      numTel: this.profileForm.get('numTel')?.value
    };

    this.profileService.updateProfile(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.profile = data;
          this.message.success('Profil mis à jour avec succès');
        },
        error: () => { this.message.error('Erreur lors de la mise à jour du profil'); this.saving = false; },
        complete: () => { this.saving = false; }
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      Object.values(this.passwordForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.savingPassword = true;
    const req = {
      oldPassword: this.passwordForm.get('oldPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value,
      confirmPassword: this.passwordForm.get('confirmPassword')?.value
    };

    this.profileService.changePassword(req)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Mot de passe changé avec succès');
          this.passwordForm.reset();
        },
        error: (err) => {
          this.message.error(err.error?.message || 'Erreur lors du changement de mot de passe');
          this.savingPassword = false;
        },
        complete: () => { this.savingPassword = false; }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.message.warning('Aucun fichier sélectionné');
      return;
    }

    const file = input.files[0];

    if (file.size > 5 * 1024 * 1024) {
      this.message.error('L\'image doit faire moins de 5MB');
      return;
    }

    this.uploadingAvatar = true;
    this.message.loading('Upload en cours...', {nzDuration: 0});

    this.profileService.uploadPhoto(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.message.remove();
          if (res['photoUrl']) {
            this.avatarPreview = this.getPhotoUrl(res['photoUrl']);
            this.profile!.photoUrl = res['photoUrl'];
            this.message.success('Photo de profil mise à jour');
          }
        },
        error: (err) => {
          this.message.remove();
          this.message.error(err.error?.message || 'Erreur lors de l\'upload');
          this.uploadingAvatar = false;
        },
        complete: () => { this.uploadingAvatar = false; }
      });
  }

  getAvatarColor(): string {
    const name = this.profile?.prenom || 'A';
    return this.avatarColors[name.charCodeAt(0) % this.avatarColors.length] || this.avatarColors[0];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
