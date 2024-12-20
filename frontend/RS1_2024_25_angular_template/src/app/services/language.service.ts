import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguageSubject = new BehaviorSubject<string>('en');
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  constructor(private translate: TranslateService) {
    this.initializeLanguage();
  }

  private initializeLanguage() {
    // Add supported languages
    this.translate.addLangs(['en', 'bs']);

    // Set default language
    this.translate.setDefaultLang('en');

    // Get stored language or browser language
    const storedLang = localStorage.getItem('preferredLanguage');
    const browserLang = this.translate.getBrowserLang();
    const initialLang = storedLang || (browserLang?.match(/en|bs/) ? browserLang : 'en');

    // Use initial language
    this.changeLanguage(initialLang);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('preferredLanguage', lang);
    this.currentLanguageSubject.next(lang);
  }

  getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }
}
