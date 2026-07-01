import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { API } from '../constants/app.constants';
import { ApiResponse } from '../models/api-response.model';
import { AdminDashboard } from '../models/admin-dashboard.model';
import { CreateClientRequest } from '../models/create-client-request.model';
import { User } from '../models/user.model';
import { Operator } from '../models/operator.model';
import { RechargePlan } from '../models/recharge-plan.model';
import { RechargePlanDTO } from '../models/recharge-plan-dto.model';
import { RechargeRequest } from '../models/recharge-request.model';
import { RechargeStatus } from '../enums/recharge-status.enum';


export interface SystemAlert {

  id: number;

  title: string;

  message: string;

  active: boolean;

  createdAt: string;

}


export interface CreateAlertDTO {

  title: string;

  message: string;

}


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
  cancelledCount?: number;

  balance: number; // ✅ ajouter

}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

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
      { params: { accept } }
    );
  }

  getRechargeRequests(page: number = 0): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}${API.ADMIN.RECHARGE}`,
      { params: { page } }
    );
  }

  getRechargesByStatus(status: RechargeStatus, page: number = 0): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}${API.ADMIN.RECHARGE}`,
      {
        params: { status, page }
      }
    );
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


  getAllClients(): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.apiUrl}${API.ADMIN.CLIENTS}/all`
    );
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

  togglePlanStatus(id: number, action: 'block' | 'unblock'): Observable<RechargePlan> {
    return this.http.patch<RechargePlan>(
      `${this.apiUrl}${API.ADMIN.PLANS}/${id}/${action}`,
      {}
    );
  }

  cancelRecharge(id: number, message: string): Observable<RechargeRequest> {
    return this.http.patch<RechargeRequest>(
      `${this.apiUrl}${API.ADMIN.RECHARGE}/${id}/cancel`,
      {},
      { params: { message } }
    );
  }

  // =========================
  // 🔔 SYSTEM ALERTS
  // =========================


  createAlert(
    dto: CreateAlertDTO
  ): Observable<SystemAlert> {


    return this.http.post<SystemAlert>(

      `${this.apiUrl}${API.ADMIN.ALERTS}`,

      dto

    );

  }





  getAlerts(): Observable<SystemAlert[]> {


    return this.http.get<SystemAlert[]>(

      `${this.apiUrl}${API.ADMIN.ALERTS}`

    );


  }





  disableAlert(
    id: number
  ): Observable<void> {


    return this.http.patch<void>(

      `${this.apiUrl}${API.ADMIN.ALERT_DISABLE(id)}`,

      {}

    );


  }
}
