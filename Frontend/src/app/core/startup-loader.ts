import { Component } from '@angular/core';

@Component({
  selector: 'app-startup-loader',
  standalone: true,
  template: `
    <div class="fixed inset-0 bg-paper-100 flex flex-col items-center justify-center z-[9999] font-sans animate-fade-in">
      <div class="relative flex items-center justify-center mb-8">
        <div class="absolute w-24 h-24 bg-amber-100 rounded-full animate-ping" style="animation-duration: 3s;"></div>
        <div class="relative z-10 w-16 h-16 border-4 border-clay-100 border-t-clay-500 rounded-full animate-spin"></div>
      </div>

      <h2 class="text-3xl font-extrabold text-ink-900 mb-3 tracking-tight font-serif">Waking up the server...</h2>
      <p class="text-ink-600/80 font-medium max-w-sm text-center">
        "We're preparing everything for you. This might take just a moment (30 sec) while our systems wake up."
      </p>
    </div>
  `
})
export class StartupLoaderComponent {}