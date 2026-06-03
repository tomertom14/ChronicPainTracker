import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './navbar.html',
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  private document = inject(DOCUMENT);

  public currentLang = signal('en');

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const savedLang = localStorage.getItem('i18n_lang') || 'en';
      this.currentLang.set(savedLang);
    }
  }

  toggleLanguage(): void {
    const nextLang = this.currentLang() === 'en' ? 'he' : 'en';
    this.currentLang.set(nextLang);
    this.translate.use(nextLang);
    
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('i18n_lang', nextLang);
    }
    
    const htmlTag = this.document.getElementsByTagName('html')[0];
    if (htmlTag) {
      htmlTag.dir = nextLang === 'he' ? 'rtl' : 'ltr';
      htmlTag.lang = nextLang;
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}