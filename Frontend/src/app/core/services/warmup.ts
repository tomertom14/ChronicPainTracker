import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WarmupService {
  public isWakingServer = signal<boolean>(false);
  
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public initiateWarmup(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isWakingServer.set(true);
      
      const url = `${environment.apiUrl}/health`;
      
      this.http.get(url).pipe(
        timeout(60000), 
        catchError(() => of(null)) 
      ).subscribe(() => {
        this.isWakingServer.set(false);
      });
    }
  }
}