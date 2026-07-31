import { Injectable, signal } from '@angular/core';

const ENABLED_KEY = 'reminder_enabled';
const HOUR_KEY = 'reminder_hour';
const LAST_SHOWN_KEY = 'reminder_last_shown_date';
const DEFAULT_HOUR = 19; // 7pm
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  enabled = signal<boolean>(false);
  hour = signal<number>(DEFAULT_HOUR);

  private watching = false;

  constructor() {
    if (isBrowser()) {
      this.enabled.set(localStorage.getItem(ENABLED_KEY) === 'true');
      const storedHour = localStorage.getItem(HOUR_KEY);
      if (storedHour !== null) {
        this.hour.set(Number(storedHour));
      }
    }
  }

  get isSupported(): boolean {
    return isBrowser() && 'Notification' in window;
  }

  enableAtCurrentHour(): void {
    if (!this.isSupported) return;

    if (Notification.permission === 'granted') {
      this.persistEnabled(true);
      return;
    }

    if (Notification.permission === 'denied') {
      this.persistEnabled(false);
      return;
    }

    Notification.requestPermission().then(permission => {
      this.persistEnabled(permission === 'granted');
    });
  }

  disable(): void {
    this.persistEnabled(false);
  }

  setHour(hour: number): void {
    this.hour.set(hour);
    if (isBrowser()) {
      localStorage.setItem(HOUR_KEY, String(hour));
    }
  }

  // Called once from the app root; periodically checks whether it's time
  // to nudge the user, while the app happens to be open in the browser.
  startWatching(): void {
    if (this.watching || !isBrowser()) return;
    this.watching = true;

    this.checkAndNotify();
    setInterval(() => this.checkAndNotify(), CHECK_INTERVAL_MS);
  }

  private persistEnabled(value: boolean): void {
    this.enabled.set(value);
    if (isBrowser()) {
      localStorage.setItem(ENABLED_KEY, String(value));
    }
  }

  private checkAndNotify(): void {
    if (!this.enabled() || !this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const today = now.toDateString();
    const lastShown = localStorage.getItem(LAST_SHOWN_KEY);

    if (lastShown === today) return;
    if (now.getHours() < this.hour()) return;

    new Notification('A moment for you', {
      body: 'Take a minute to check in with how you\'re feeling today.',
      icon: '/favicon.ico'
    });

    localStorage.setItem(LAST_SHOWN_KEY, today);
  }
}
