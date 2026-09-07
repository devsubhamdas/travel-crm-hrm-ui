import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme';
  private isBrowser: boolean;
  currentMode: ThemeMode = 'light';

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initTheme();
  }

  initTheme() {
    if (!this.isBrowser) return; // SSR guard

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved =
      (localStorage.getItem(this.storageKey) as ThemeMode) ?? (prefersDark ? 'dark' : 'light');

    this.applyTheme(saved);
  }

  set(mode: ThemeMode) {
    if (!this.isBrowser) return;
    this.applyTheme(mode);
  }

  toggle() {
    if (!this.isBrowser) return;

    const html = this.document.documentElement;
    const isDark = html.classList.contains('app-dark-mode');
    this.applyTheme(isDark ? 'light' : 'dark');
  }

  private applyTheme(mode: ThemeMode) {
    const html = this.document.documentElement;
    html.classList.toggle('app-dark-mode', mode === 'dark');
    localStorage.setItem(this.storageKey, mode);
    this.currentMode = mode;
  }
}
