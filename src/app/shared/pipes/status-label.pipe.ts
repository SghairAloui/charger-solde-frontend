import {Pipe, PipeTransform} from '@angular/core';
import {RechargeStatus} from '../../core/enums/recharge-status.enum';

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(status: RechargeStatus | string): string {
    const labels: Record<string, string> = {
      [RechargeStatus.PENDING]: 'En attente',
      [RechargeStatus.VALIDATED]: 'Validée',
      [RechargeStatus.REJECTED]: 'Rejetée',
      [RechargeStatus.ADMIN_CANCELLED]: 'Rejetée',

    };
    return labels[status] || status;
  }
}
