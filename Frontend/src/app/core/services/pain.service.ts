import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PainEntryCreate, PainEntryResponse, PainInsights } from '../models/pain.models';

@Injectable({
  providedIn: 'root'
})
export class PainService {
  private apiUrl = `${environment.apiUrl}/pain`;

  constructor(private http: HttpClient) {}

  createEntry(dto: PainEntryCreate): Observable<{ message: string; entryId: number }> {
    return this.http.post<{ message: string; entryId: number }>(this.apiUrl, dto);
  }

  getEntries(): Observable<PainEntryResponse[]> {
    return this.http.get<PainEntryResponse[]>(this.apiUrl);
  }

  getEntry(id: number): Observable<PainEntryResponse> {
    return this.http.get<PainEntryResponse>(`${this.apiUrl}/${id}`);
  }

  getInsights(): Observable<PainInsights> {
    return this.http.get<PainInsights>(`${this.apiUrl}/insights`);
  }
}
