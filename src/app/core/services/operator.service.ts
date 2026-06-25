import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {API} from '../constants/app.constants';
import {Operator} from '../models/operator.model';
import {RechargePlan} from '../models/recharge-plan.model';

@Injectable({providedIn: 'root'})
export class OperatorService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Operator[]> {
    return this.http.get<Operator[]>(`${this.apiUrl}${API.OPERATORS.BASE}`);
  }

  getPlans(operatorId: number): Observable<RechargePlan[]> {
    return this.http.get<RechargePlan[]>(`${this.apiUrl}${API.OPERATORS.PLANS(operatorId)}`);
  }
}
