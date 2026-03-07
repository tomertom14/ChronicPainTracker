import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginRequest } from '../../../core/auth/auth.models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials: LoginRequest = { username: '', password: '' };
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Login successful! Token saved.');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Invalid username or password.';
        console.error('Login error:', err);
        // Force Angular to refresh the UI immediately
        this.cdr.detectChanges();
      }
    });
  }
}