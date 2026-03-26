import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { DAILY_PROMPTS } from './prompts.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  userName = signal<string>('Guest');
  dailyPrompt = signal<string>('');
  greetingKey = signal<string>('DASHBOARD.GOOD_MORNING');
  
  // Example of a 'computed' signal - it updates automatically when userName changes
  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'DASHBOARD.GOOD_MORNING';
    if (hour >= 12 && hour < 18) return 'DASHBOARD.GOOD_AFTERNOON';
    return 'DASHBOARD.GOOD_EVENING';
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const fetchedName = this.authService.getCurrentUsername();
    if (fetchedName) {
      this.userName.set(fetchedName);
    }
    this.setDailyPrompt();
    this.updateGreetingKey();
  }

  updateGreetingKey(): void {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      this.greetingKey.set('DASHBOARD.GOOD_MORNING');
    } else if (hour >= 12 && hour < 18) {
      this.greetingKey.set('DASHBOARD.GOOD_AFTERNOON');
    } else {
      this.greetingKey.set('DASHBOARD.GOOD_EVENING');
    }
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