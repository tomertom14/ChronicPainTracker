import { Component } from '@angular/core';

@Component({
  selector: 'app-startup-loader',
  standalone: true,
  template: `
    <div class="fixed inset-0 bg-stone-50 flex flex-col items-center justify-center z-[9999] font-sans animate-fade-in">
      <div class="relative flex items-center justify-center mb-8">
        <div class="absolute w-24 h-24 bg-teal-100 rounded-full animate-ping" style="animation-duration: 3s;"></div>
        <div class="relative z-10 w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>

      <h2 class="text-3xl font-extrabold text-emerald-950 mb-3 tracking-tight">Waking up the server...</h2>
      <p class="text-emerald-700/80 font-medium max-w-sm text-center">
        The backend is starting up. This might take up to 50 seconds on the free tier.
      </p>
    </div>
  `
})
export class StartupLoaderComponent {}