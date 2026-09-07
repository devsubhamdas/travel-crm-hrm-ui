import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainSidebar } from '../../core/main-sidebar/main-sidebar';
import { MainHeader } from '../../core/main-header/main-header';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, MainSidebar, MainHeader],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements AfterViewInit, OnDestroy {
  @ViewChild('mainScrollableContent', { static: true })
  mainScrollableContent!: ElementRef<HTMLElement>;

  @ViewChild('mainHeader', { read: ElementRef })
  mainHeader?: ElementRef<HTMLElement>;

  private headerResizeObserver?: ResizeObserver;
  measuredHeaderHeight = 0;
  mainHeaderHeight = 0;

  // show and hide main-sidebar for small screens
  showSidebar = true;
  showMainHeader = true;
  isBrowser!: boolean;
  private touchStartX = 0;
  private touchEndX = 0;
  private touchStartY = 0;
  private touchEndY = 0;

  // swipe area limit for sidebar and main-header view control
  private readonly SWIPE_THRESHOLD = 60; // px
  private readonly LEFT_EDGE_LIMIT = 75; // px from left
  private readonly TOP_EDGE_LIMIT = 100; // px from top

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
  ) {
    if (isPlatformBrowser(this.platformId)) this.isBrowser = true;
  }

  ngAfterViewInit() {
    // calculate main-header offset-height so that page-menubar evaluate/re-evaluate sticky-top offset position
    if (!this.isBrowser) return;

    const headerEl = this.mainHeader?.nativeElement;
    if (!headerEl) return;

    requestAnimationFrame(() => {
      // Initial measurement of main-header
      this.measuredHeaderHeight = headerEl.offsetHeight;
      this.updateEffectiveHeaderHeight();
      this.cdr.detectChanges();

      const RO: typeof ResizeObserver | undefined =
        typeof window !== 'undefined' ? window.ResizeObserver : undefined;
      if (!RO) return;

      const observer = new RO((entries: ResizeObserverEntry[]) => {
        const entry = entries[0];
        if (!entry) return;

        const newHeight = Math.ceil(entry.contentRect.height);
        if (newHeight > 0) {
          this.measuredHeaderHeight = newHeight;
          this.updateEffectiveHeaderHeight();
        }
      });

      observer.observe(headerEl);
      this.headerResizeObserver = observer;
    });

    if (!this.canMainContentScroll()) {
      this.showMainHeader = true;
      this.updateEffectiveHeaderHeight();
    }
  }

  ngOnDestroy(): void {
    this.headerResizeObserver?.disconnect();
  }

  onTouchStart(event: TouchEvent) {
    const touch = event.changedTouches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTouchEnd(event: TouchEvent) {
    const touch = event.changedTouches[0];
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;
    this.handleSidebarViewOnSwipe();
    this.handleMainHeaderViewOnSwipe();
  }

  private handleSidebarViewOnSwipe() {
    // ignore large screen or swipe area
    if (
      (this.isBrowser && window.innerWidth >= 720) ||
      this.touchStartX < this.LEFT_EDGE_LIMIT ||
      this.touchStartY > this.TOP_EDGE_LIMIT
    )
      return;

    const deltaX = this.touchEndX - this.touchStartX;
    const absX = Math.abs(deltaX);

    // ignore small movements
    if (absX < this.SWIPE_THRESHOLD) return;

    this.showSidebar = deltaX > 0 ? true : false;
  }

  private handleMainHeaderViewOnSwipe() {
    // ignore if main content doesn't scroll
    if (!this.canMainContentScroll()) return;

    // ignore large screen or swipe area
    if (
      (this.isBrowser && window.innerWidth >= 720) ||
      this.touchStartX < this.LEFT_EDGE_LIMIT ||
      this.touchStartY < this.TOP_EDGE_LIMIT
    )
      return;

    const deltaY = this.touchEndY - this.touchStartY;
    const absY = Math.abs(deltaY);

    // ignore small movements
    if (absY < this.SWIPE_THRESHOLD) return;

    this.showMainHeader = deltaY > 0 ? true : false;
    this.updateEffectiveHeaderHeight();
  }

  private updateEffectiveHeaderHeight() {
    this.mainHeaderHeight = this.showMainHeader ? this.measuredHeaderHeight : 0;
  }

  private canMainContentScroll(): boolean {
    const el = this.mainScrollableContent.nativeElement;
    return el.scrollHeight > el.clientHeight;
  }
}
