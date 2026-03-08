import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { DAILY_PROMPTS } from './prompts.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  userName = signal<string>('Guest');
  dailyPrompt = signal<string>('');
  
  // Example of a 'computed' signal - it updates automatically when userName changes
  greeting = computed(() => {
    const hour = new Date().getHours();
    const name = this.userName();
    if (hour >= 5 && hour < 12) return `Good Morning, ${name}`;
    if (hour >= 12 && hour < 18) return `Good Afternoon, ${name}`;
    return `Good Evening, ${name}`;
  });

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const fetchedName = this.authService.getCurrentUsername();
    if (fetchedName) {
      this.userName.set(fetchedName);
    }
    this.setDailyPrompt();
  }

  setDailyPrompt(): void {
    const randomIndex = Math.floor(Math.random() * DAILY_PROMPTS.length);
    this.dailyPrompt.set(DAILY_PROMPTS[randomIndex]);
  }

  onStartPractice(): void {
    this.router.navigate(['/practice']);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}