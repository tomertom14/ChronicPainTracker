import { Component, OnInit, inject, signal, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { WarmupService } from './core/services/warmup';
import { StartupLoaderComponent } from './core/startup-loader';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StartupLoaderComponent, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('ChronicPainTrackerUI');
  public warmupService = inject(WarmupService);
  public currentLang = signal('en');

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    // Check localStorage or default to 'en'
    let savedLang = 'en';
    if (typeof localStorage !== 'undefined') {
      savedLang = localStorage.getItem('i18n_lang') || 'en';
    }
    this.translate.setDefaultLang('en');
    this.setLanguage(savedLang);
  }

  ngOnInit(): void {
    this.warmupService.initiateWarmup();
  }

  toggleLanguage(): void {
    const nextLang = this.currentLang() === 'en' ? 'he' : 'en';
    this.setLanguage(nextLang);
  }

  private setLanguage(lang: string): void {
    this.currentLang.set(lang);
    this.translate.use(lang);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('i18n_lang', lang);
    }
    
    // Set text direction
    const htmlTag = this.document.getElementsByTagName('html')[0];
    if (htmlTag) {
      htmlTag.dir = lang === 'he' ? 'rtl' : 'ltr';
      htmlTag.lang = lang;
    }
  }
}