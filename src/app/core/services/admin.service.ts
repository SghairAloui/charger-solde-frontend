import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {API} from '../constants/app.constants';
import {ApiResponse} from '../models/api-response.model';
import {AdminDashboard} from '../models/admin-dashboard.model';
import {CreateClientRequest} from '../models/create-client-request.model';
import {User} from '../models/user.model';
import {Operator} from '../models/operator.model';
import {RechargePlan} from '../models/recharge-plan.model';
import {RechargePlanDTO} from '../models/recharge-plan-dto.model';
import {RechargeRequest} from '../models/recharge-request.model';
import {RechargeStatus} from '../enums/recharge-status.enum';

export interface ClientRechargeSummary {
  clientId: number;
  nom: string;
  prenom: string;
  email: string;
  totalRecharges: number;
  totalAmount: number;
  pendingCount: number;
  validatedCount: number;
  rejectedCount: number;
}

@Injectable({providedIn: 'root'})
export class AdminService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.apiUrl}${API.ADMIN.DASHBOARD}`);
  }

  createClient(request: CreateClientRequest): Observable<ApiResponse<Record<string, unknown>>> {
    return this.http.post<ApiResponse<Record<string, unknown>>>(`${this.apiUrl}${API.ADMIN.CLIENTS}`, request);
  }

  getClients(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}${API.ADMIN.CLIENTS}`)
      .pipe(map(res => res.data));
  }

  createOperator(operator: Partial<Operator>): Observable<Operator> {
    return this.http.post<Operator>(`${this.apiUrl}${API.ADMIN.OPERATORS}`, operator);
  }

  createPlan(dto: RechargePlanDTO): Observable<RechargePlan> {
    return this.http.post<RechargePlan>(`${this.apiUrl}${API.ADMIN.PLANS}`, dto);
  }

  validateRecharge(id: number, accept: boolean): Observable<RechargeRequest> {
    return this.http.patch<RechargeRequest>(
      `${this.apiUrl}${API.ADMIN.RECHARGE}/${id}`,
      {},
      {params: {accept}}
    );
  }

  getRechargeRequests(): Observable<RechargeRequest[]> {
    return this.http.get<RechargeRequest[]>(`${this.apiUrl}${API.ADMIN.RECHARGE}`);
  }

  getRechargesByStatus(status: RechargeStatus): Observable<RechargeRequest[]> {
    return this.http.get<RechargeRequest[]>(`${this.apiUrl}${API.ADMIN.RECHARGE}`, {
      params: {status}
    });
  }

  deleteOperator(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${API.ADMIN.OPERATORS}/${id}`);
  }

  updatePlan(id: number, dto: RechargePlanDTO): Observable<RechargePlan> {
    return this.http.put<RechargePlan>(`${this.apiUrl}${API.ADMIN.PLANS}/${id}`, dto);
  }

  deletePlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${API.ADMIN.PLANS}/${id}`);
  }

  toggleClientStatus(id: number): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.apiUrl}${API.ADMIN.CLIENT_STATUS(id)}`, {})
      .pipe(map(res => res.data));
  }

  getClientRechargeSummary(): Observable<ClientRechargeSummary[]> {
    return this.http.get<ClientRechargeSummary[]>(`${this.apiUrl}${API.ADMIN.CLIENT_RECHARGE_SUMMARY}`);
  }


  getPendingClients(): Observable<User[]> {
  return this.http
    .get<ApiResponse<User[]>>(`${this.apiUrl}${API.ADMIN.CLIENTS}/pending`)
    .pipe(map(res => res.data));
}

approveClient(id: number): Observable<any> {
  return this.http.put(
    `${this.apiUrl}${API.ADMIN.CLIENTS}/${id}/approve`,
    {}
  );
}

rejectClient(id: number): Observable<any> {
  return this.http.put(
    `${this.apiUrl}${API.ADMIN.CLIENTS}/${id}/reject`,
    {}
  );
}
}
