import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'preferred-theme';
  private isDarkModeSubject = new BehaviorSubject<boolean>(this.getStoredTheme() === 'dark');
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    // Initialize theme from stored preference or system preference
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const storedTheme = this.getStoredTheme();
    if (storedTheme) {
      this.applyTheme(storedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!this.getStoredTheme()) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
  }

  toggleTheme(): void {
    const newTheme = this.isDarkModeSubject.value ? 'light' : 'dark';
    this.applyTheme(newTheme);
    localStorage.setItem(this.THEME_KEY, newTheme);
  }

  private applyTheme(theme: Theme): void {
    const isDark = theme === 'dark';
    this.isDarkModeSubject.next(isDark);

    // Apply theme classes to body
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#1a1a1a' : '#ffffff');
    }
  }

  private getStoredTheme(): Theme | null {
    const theme = localStorage.getItem(this.THEME_KEY) as Theme;
    return theme && ['light', 'dark'].includes(theme) ? theme : null;
  }

  getCurrentTheme(): Theme {
    return this.isDarkModeSubject.value ? 'dark' : 'light';
  }
}
