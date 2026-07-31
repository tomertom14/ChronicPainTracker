import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PracticeInsights, PracticeSessionResponse } from '../models/practice.models';

@Injectable({
  providedIn: 'root'
})
export class PracticeService {
  private apiUrl = `${environment.apiUrl}/practice`;

  constructor(private http: HttpClient) {}

  getSessions(): Observable<PracticeSessionResponse[]> {
    return this.http.get<PracticeSessionResponse[]>(this.apiUrl);
  }

  getSession(id: number): Observable<PracticeSessionResponse> {
    return this.http.get<PracticeSessionResponse>(`${this.apiUrl}/${id}`);
  }

  getInsights(): Observable<PracticeInsights> {
    return this.http.get<PracticeInsights>(`${this.apiUrl}/insights`);
  }
}
