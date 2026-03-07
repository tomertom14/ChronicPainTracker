import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterRequest } from '../../../core/auth/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  credentials: RegisterRequest = { username: '', password: '' };
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) {}

  onSubmit(): void {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please enter both username and password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.credentials).subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Registration successful!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        // Handling both object error and string error from backend
        this.errorMessage = err.error?.message || err.error || 'Registration failed.';
        this.cdr.detectChanges();
      }
    });
  }
}