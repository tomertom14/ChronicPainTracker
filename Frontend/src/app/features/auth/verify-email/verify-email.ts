import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  templateUrl: './verify-email.html',
  styleUrls: ['./verify-email.css']
})
export class VerifyEmailComponent implements OnInit {
  status: 'loading' | 'success' | 'error' = 'loading';
  errorMessage: string = '';

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
        this.status = 'error';
        this.errorMessage = 'Invalid verification link. Missing parameters.';
      }
    });
  }

  verifyUserEmail(email: string, token: string): void {
    this.authService.confirmEmail(email, token).subscribe({
      next: () => {
        this.status = 'success';
      },
      error: (err) => {
        this.status = 'error';
        // Extract error message from backend if available
        this.errorMessage = err.error?.message || err.error || 'Verification failed. The link might be expired or invalid.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}