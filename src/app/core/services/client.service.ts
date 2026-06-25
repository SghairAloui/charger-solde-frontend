import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {API} from '../constants/app.constants';
import {CreateRechargeRequestDTO} from '../models/create-recharge-request.model';
import {RechargeRequest} from '../models/recharge-request.model';

@Injectable({providedIn: 'root'})
export class ClientService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  createRecharge(dto: CreateRechargeRequestDTO): Observable<RechargeRequest> {
    return this.http.post<RechargeRequest>(`${this.apiUrl}${API.CLIENT.RECHARGE}`, dto);
  }

  getMyRecharges(): Observable<RechargeRequest[]> {
    return this.http.get<RechargeRequest[]>(`${this.apiUrl}${API.CLIENT.RECHARGES}`);
  }
}
