import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  // We keep the username to personalize the greeting
  userName: string = 'Tomer';

  constructor(private authService: AuthService, private router: Router) {}

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onStartPractice(): void {
    // This route doesn't exist yet, we will create it next!
    console.log('Starting emotional practice...');
    this.router.navigate(['/practice']); 
  }
}