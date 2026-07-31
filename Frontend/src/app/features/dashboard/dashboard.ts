import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { PracticeService } from '../../core/services/practice.service';
import { ReminderService } from '../../core/services/reminder.service';
import { DAILY_PROMPTS } from './prompts.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private reminderService = inject(ReminderService);

  userName = signal<string>('Guest');
  dailyPrompt = signal<string>('');
  greetingKey = signal<string>('DASHBOARD.GOOD_MORNING');

  streakLoaded = signal<boolean>(false);
  currentStreak = signal<number>(0);

  reminderEnabled = this.reminderService.enabled;
  reminderHour = this.reminderService.hour;
  reminderHours = Array.from({ length: 24 }, (_, i) => i);

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
    private translate: TranslateService,
    private practiceService: PracticeService
  ) {}

  ngOnInit(): void {
    const fetchedName = this.authService.getCurrentUsername();
    if (fetchedName) {
      this.userName.set(fetchedName);
    }
    this.setDailyPrompt();
    this.updateGreetingKey();

    this.practiceService.getInsights().subscribe({
      next: (insights) => {
        this.currentStreak.set(insights.currentStreak);
        this.streakLoaded.set(true);
      },
      error: () => this.streakLoaded.set(false)
    });
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

  toggleReminder(): void {
    if (this.reminderEnabled()) {
      this.reminderService.disable();
    } else {
      this.reminderService.enableAtCurrentHour();
    }
  }

  onReminderHourChange(hour: string): void {
    this.reminderService.setHour(Number(hour));
  }
}
