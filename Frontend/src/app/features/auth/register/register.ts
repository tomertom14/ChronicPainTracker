import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, TranslateModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  
  // Define signals with initial values
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      // Update signals using .set()
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.successMessage.set('Registration successful! Please check your email to verify your account.');
          this.registerForm.reset();
        },
        error: (err) => {
          this.isLoading.set(false); 
          
          // Safely extract the error message
          try {
            if (typeof err.error === 'string') {
              this.errorMessage.set(err.error);
            } else if (err?.error?.errors) {
              const firstErrorKey = Object.keys(err.error.errors)[0];
              this.errorMessage.set(err.error.errors[firstErrorKey][0]);
            } else if (err?.error?.message) {
              this.errorMessage.set(err.error.message);
            } else if (err?.message) {
              this.errorMessage.set(err.message);
            } else {
              this.errorMessage.set('Registration failed. Please check your details and try again.');
            }
          } catch (e) {
            this.errorMessage.set('An unexpected error occurred during registration.');
          }
        }
      });
    }
  }
}