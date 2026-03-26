import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './verify-email.html'
})
export class VerifyEmailComponent implements OnInit {
  // Using signals for state management
  status = signal<'loading' | 'success' | 'error'>('loading');
  errorMessage = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      const token = params['token'];

      if (email && token) {
        this.verifyUserEmail(email, token);
      } else {
        this.status.set('error');
        this.errorMessage.set('Invalid verification link. Missing parameters.');
      }
    });
  }

  verifyUserEmail(email: string, token: string): void {
    this.authService.confirmEmail(email, token).subscribe({
      next: () => {
        this.status.set('success');
      },
      error: (err) => {
        this.status.set('error');
        const msg = err.error?.message || err.error || 'Verification failed.';
        this.errorMessage.set(msg);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}