import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {API} from '../constants/app.constants';

export interface MessageDTO {
  id?: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({providedIn: 'root'})
export class ChatService {
  private readonly base = `${environment.apiUrl}${API.MESSAGES.BASE}`;

  constructor(private readonly http: HttpClient) {}

  sendMessage(receiverId: number, content: string): Observable<MessageDTO> {
    return this.http.post<any>(this.base, {receiverId, content}).pipe(
      map(r => r.data)
    );
  }

  getConversation(userId: number): Observable<MessageDTO[]> {
    return this.http.get<any>(`${this.base}/conversation/${userId}`).pipe(
      map(r => r.data || [])
    );
  }

  getAllMessages(): Observable<MessageDTO[]> {
    return this.http.get<any>(this.base).pipe(
      map(r => r.data || [])
    );
  }
}
