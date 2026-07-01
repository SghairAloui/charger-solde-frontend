import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {API} from '../constants/app.constants';
import {CreateRechargeRequestDTO} from '../models/create-recharge-request.model';
import {RechargeRequest} from '../models/recharge-request.model';
import { PageResponse } from '../models/PageResponse';
import { SystemAlert } from './admin.service';

@Injectable({providedIn: 'root'})
export class ClientService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  createRecharge(dto: CreateRechargeRequestDTO): Observable<RechargeRequest> {
    return this.http.post<RechargeRequest>(`${this.apiUrl}${API.CLIENT.RECHARGE}`, dto);
  }

getMyRecharges(page: number, size: number): Observable<PageResponse<RechargeRequest>> {
  const params = new HttpParams()
    .set('page', page)
    .set('size', size);

  return this.http.get<PageResponse<RechargeRequest>>(
    `${this.apiUrl}${API.CLIENT.RECHARGES}`,
    { params }
  );
}

getAllMyRecharges(): Observable<RechargeRequest[]> {
  return this.http.get<any>(
    `${this.apiUrl}${API.CLIENT.RECHARGES}/all`
  ).pipe(
    map(r => r.data ?? r)   // ✅ FIX IMPORTANT
  );
}


getActiveAlerts(): Observable<SystemAlert[]> {
  return this.http.get<SystemAlert[]>(
    `${this.apiUrl}${API.CLIENT.ALERTS}`
  );
}
}
