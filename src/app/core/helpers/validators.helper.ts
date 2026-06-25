import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class ValidatorsHelper {
  static phoneNumberTunisia(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valid = /^[2459]\d{7}$/.test(control.value);
      return valid ? null : {phone: 'Numéro de téléphone tunisien invalide'};
    };
  }

  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value || '';
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      const valid = value.length >= 8 && hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
      return valid ? null : {passwordStrength: 'Le mot de passe doit contenir 8 caractères minimum, majuscule, minuscule, chiffre et caractère spécial'};
    };
  }

  static matchPassword(passwordField: string, confirmField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get(passwordField);
      const confirm = control.get(confirmField);
      if (password?.value !== confirm?.value) {
        confirm?.setErrors({mismatch: 'Les mots de passe ne correspondent pas'});
        return {mismatch: true};
      }
      if (confirm?.hasError('mismatch')) {
        const {mismatch, ...rest} = confirm.errors!;
        confirm.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    };
  }
}
