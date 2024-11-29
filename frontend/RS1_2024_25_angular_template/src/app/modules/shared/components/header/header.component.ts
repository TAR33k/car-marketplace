import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../../../services/theme.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isDarkMode = false;
  searchControl = new FormControl('');
  isLoggedIn = false; // This should be managed by your auth service

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Subscribe to theme changes
    this.themeService.isDarkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );

    // Handle search input with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value) {
        this.handleSearch(value);
      }
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  handleSearch(searchTerm: string) {
    if (searchTerm.trim()) {
      this.router.navigate(['/cars'], {
        queryParams: { search: searchTerm }
      });
    }
  }

  navigateToSell() {
    this.router.navigate(['/client/sell']);
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }
  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }
  navigateToHome() {
    this.router.navigate(['/']);
  }
  navigateToProfile() {
    this.router.navigate(['/client/profile']);
  }
  navigateToSettings() {
    this.router.navigate(['/client/settings']);
  }
  onLogout() {
// Implement logout logic
    this.router.navigate(['/auth/logout']);
  }
}
