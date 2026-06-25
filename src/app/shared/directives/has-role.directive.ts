import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {Role} from '../../core/enums/role.enum';
import {AuthService} from '../../core/services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private roles: Role[] = [];
  private isHidden = true;

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainer: ViewContainerRef,
    private readonly authService: AuthService
  ) {}

  @Input()
  set appHasRole(roles: Role | Role[]) {
    this.roles = Array.isArray(roles) ? roles : [roles];
    this.update();
  }

  private update(): void {
    const user = this.authService.getCurrentUser();
    const hasRole = user ? this.roles.includes(user.role) : false;

    if (hasRole && this.isHidden) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isHidden = false;
    } else if (!hasRole && !this.isHidden) {
      this.viewContainer.clear();
      this.isHidden = true;
    }
  }
}
