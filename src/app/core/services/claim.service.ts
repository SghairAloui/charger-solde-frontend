import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { API } from '../constants/app.constants';
import { PageResponse } from '../models/PageResponse';

export type ClaimStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export interface ClaimDTO {
  id: number;
  userId: number;
  userName: string;

  phoneNumber: string; // ✅ ADD
  subject: string;

  status: ClaimStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateClaimRequest {
  phoneNumber: string;
  subject: string;
}

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private readonly base = `${environment.apiUrl}${API.CLAIMS.BASE}`;

  constructor(private readonly http: HttpClient) { }

  createClaim(request: CreateClaimRequest): Observable<ClaimDTO> {
    return this.http.post<any>(this.base, request).pipe(map(r => r.data));
  }

  getMyClaims(page: number, size: number): Observable<PageResponse<ClaimDTO>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http
      .get<any>(`${this.base}/my`, { params })
      .pipe(map(r => r.data));
  }

getAllClaims(page: number, size: number): Observable<PageResponse<ClaimDTO>> {
  const params = new HttpParams()
    .set('page', page)
    .set('size', size);

  return this.http
    .get<any>(this.base, { params })
    .pipe(map(r => r.data));
}

  updateStatus(id: number, status: ClaimStatus, response?: string): Observable<ClaimDTO> {
    return this.http.put<any>(`${this.base}/${id}/status?status=${status}`, { response }).pipe(
      map(r => r.data)
    );
  }
}
