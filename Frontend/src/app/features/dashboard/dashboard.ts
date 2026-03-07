import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { DAILY_PROMPTS } from './prompts.data';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  userName: string = 'Tomer';
  greeting: string = '';
  dailyPrompt: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.setGreeting();
    this.setDailyPrompt();
  }

  setGreeting(): void {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      this.greeting = `Good Morning, ${this.userName}`;
    } else if (hour >= 12 && hour < 18) {
      this.greeting = `Good Afternoon, ${this.userName}`;
    } else {
      this.greeting = `Good Evening, ${this.userName}`;
    }
  }

  setDailyPrompt(): void {
    const randomIndex = Math.floor(Math.random() * DAILY_PROMPTS.length);
    this.dailyPrompt = DAILY_PROMPTS[randomIndex];
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onStartPractice(): void {
    this.router.navigate(['/practice']); 
  }
}