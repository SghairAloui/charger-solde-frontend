import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeKey = 'tunitopup-theme';
  private darkThemeSubject = new BehaviorSubject<boolean>(false);
  
  isDarkTheme$ = this.darkThemeSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initTheme();
    }
  }

  private initTheme(): void {
    const savedTheme = localStorage.getItem(this.themeKey);
    if (savedTheme) {
      this.setTheme(savedTheme === 'dark');
    } else {
      // Default is light (white) as requested
      this.setTheme(false);
    }
  }

  public toggleTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setTheme(!this.darkThemeSubject.value);
    }
  }

  public setTheme(isDark: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      this.darkThemeSubject.next(isDark);
      localStorage.setItem(this.themeKey, isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }
}
