import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {API} from '../constants/app.constants';
import {ProfileResponse} from '../models/profile.model';
import {UpdateProfileRequest} from '../models/update-profile-request.model';
import {ChangePasswordRequest} from '../models/change-password-request.model';

@Injectable({providedIn: 'root'})
export class ProfileService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}${API.PROFILE.BASE}`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}${API.PROFILE.BASE}`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<Record<string, string>> {
    return this.http.put<Record<string, string>>(`${this.apiUrl}${API.PROFILE.PASSWORD}`, request);
  }

  uploadPhoto(file: File): Observable<Record<string, string>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Record<string, string>>(`${this.apiUrl}${API.PROFILE.PHOTO}`, formData);
  }

  deletePhoto(): Observable<Record<string, string>> {
    return this.http.delete<Record<string, string>>(`${this.apiUrl}${API.PROFILE.PHOTO}`);
  }
}
