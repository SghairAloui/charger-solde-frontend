import {RechargeStatus} from '../enums/recharge-status.enum';
import {RechargePlan} from './recharge-plan.model';
import {User} from './user.model';

export interface RechargeRequest {
  id: number;
  phoneNumber: string;
  amount: number;
  status: RechargeStatus;
  plan: RechargePlan;
  client: User;
  createdAt: Date;
}
