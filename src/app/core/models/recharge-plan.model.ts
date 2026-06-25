import {Operator} from './operator.model';

export interface RechargePlan {
  id: number;
  label: string;
  price: number;
  validityDays: number;
  operator?: Operator;
}
