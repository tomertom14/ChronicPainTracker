import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse } from './auth.models'; 
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;
  private tokenKey = 'jwt_token';

  constructor(private http: HttpClient) { }

  register(user: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, { responseType: 'text' });
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.saveToken(response.token))
    );
  }

  private saveToken(token: string): void {
    // Check if we are running in the browser before using localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.tokenKey);
    }
    return null; // Return null if we are on the server
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decodedToken: any = jwtDecode(token);
      const isExpired = decodedToken.exp * 1000 < Date.now();
      return !isExpired;
    } catch(Error) {
      return false;
    }
  }

  getCurrentUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      
      const dotNetNameClaim = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';
      
      // Return the username, checking multiple possible keys just in case
      return decodedToken[dotNetNameClaim] || decodedToken.name || decodedToken.unique_name || null;
    } catch(error) {
      return null;
    }
  }

  confirmEmail(email: string, token: string): Observable<any> {
  // We use encodeURIComponent to safely handle special characters in tokens
  const url = `${this.apiUrl}/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  return this.http.get(url);
  }
}