import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from '../../../services/theme/theme-service';
import { Tooltip } from 'primeng/tooltip';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-main-header',
  imports: [ButtonModule, Tooltip, OverlayBadgeModule, CommonModule],
  templateUrl: './main-header.html',
  styleUrl: './main-header.scss',
})
export class MainHeader implements OnInit {
  private isBrowser: boolean;
  isMobileOrTab!: boolean;
  title = '';
  summary = '';
  themeMode!: 'light' | 'dark';

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private router: Router,
    private route: ActivatedRoute,
    private ts: ThemeService,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) this.isMobileOrTab = window.matchMedia('(max-width: 720px)').matches;
    // Initialize Theme and set current theme mode
    this.themeMode = this.ts.currentMode;

    // Load page data on first load
    this.updateFromRoute(this.route);

    // Load page data on subsequent navigations
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updateFromRoute(this.route));
  }

  private updateFromRoute(route: ActivatedRoute) {
    let current = route;

    // Go to deepest child
    while (current.firstChild) {
      current = current.firstChild;
    }

    // Traverse upwards until we find title/summary
    while (current && !current.snapshot.data['title']) {
      current = current.parent!;
    }

    const data = current?.snapshot.data ?? {};
    this.title = data['title'] ?? '';
    this.summary = data['summary'] ?? '';
  }

  setDark() {
    this.ts.set('dark');
    this.themeMode = this.ts.currentMode;
  }

  setLight() {
    this.ts.set('light');
    this.themeMode = this.ts.currentMode;
  }
}
