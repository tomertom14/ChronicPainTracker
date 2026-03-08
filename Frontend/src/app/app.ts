import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WarmupService } from './core/services/warmup';
import { StartupLoaderComponent } from './core/startup-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StartupLoaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('ChronicPainTrackerUI');
  public warmupService = inject(WarmupService);

  ngOnInit(): void {
    this.warmupService.initiateWarmup();
  }
}