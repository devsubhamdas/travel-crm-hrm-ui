import { Component, Inject, model, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { MenuItem } from 'primeng/api';
import { FluidModule } from 'primeng/fluid';
import { AutoFocusModule } from 'primeng/autofocus';
import { TooltipModule } from 'primeng/tooltip';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { PopoverModule } from 'primeng/popover';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../services/auth/auth-service';

@Component({
  selector: 'app-main-sidebar',
  imports: [
    MenuModule,
    AvatarModule,
    ButtonModule,
    FluidModule,
    AutoFocusModule,
    RouterLink,
    RouterLinkActive,
    TooltipModule,
    TagModule,
    PopoverModule,
    RippleModule,
    CommonModule,
    NgOptimizedImage,
  ],
  templateUrl: './main-sidebar.html',
  styleUrl: './main-sidebar.scss',
})
export class MainSidebar implements OnInit {
  private readonly storageKey = 'sidebar-expanded';
  private isBrowser: boolean;
  isMobileOrTab!: boolean; // max-width: <= 720px
  expandSidebar!: boolean;
  showSidebar = model<boolean>(true);
  // showSidebarChange = output<boolean>();
  menuItems: MenuItem[] | undefined;
  user = signal<any>(null);

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private auth: AuthService,
    private router: Router,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) this.isMobileOrTab = window.matchMedia('(max-width: 720px)').matches;
    // init primeng menu component
    this.initMenuItems();
    // default value expanded true and force false and do not store current setting for small screens
    this.initSidebarDefaultValue();

    // assign user
    const id = this.auth.getUserId();
    if (id) {
      this.auth.getUser(id).subscribe({
        next: (data: any) => {
          if (data.success) {
            this.user.set(data.data);
          }
        },
        error: (err) => console.log(err),
      });
    }
  }

  handleSidebarExpandOrCollapse() {
    // restrict if screen size is mobile or tab or else continue
    if (this.isMobileOrTab) return;
    this.expandSidebar = !this.expandSidebar;

    // restrict if platform is not browser or else continue
    if (!this.isBrowser) return;
    localStorage.setItem(this.storageKey, JSON.stringify(this.expandSidebar));
  }

  private initSidebarDefaultValue() {
    // if mobile or tab don't store current sidebar option
    if (this.isMobileOrTab) {
      this.expandSidebar = false;
    } else {
      // define default value and store
      if (!this.isBrowser) return;
      const saved = localStorage.getItem(this.storageKey);
      this.expandSidebar = saved !== null ? JSON.parse(saved) : true;
    }
  }

  private initMenuItems(): void {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-chart-bar',
        routerLink: ['/dashboard'],
        visible: this.auth.hasPermission(['admin', 'manager']),
      },
      {
        label: 'Leads',
        icon: 'pi pi-users',
        routerLink: ['/leads'],
        visible: this.auth.hasPermission(['admin', 'sales', 'operator']),
      },
      {
        label: 'Operations',
        icon: 'pi pi-clipboard',
        routerLink: ['/operations'],
        visible: this.auth.hasPermission(['admin', 'operator']),
      },
      {
        label: 'Tours',
        icon: 'pi pi-map',
        routerLink: ['/tours'],
        visible: this.auth.hasPermission(['admin', 'manager']),
      },
      {
        label: 'POS',
        icon: 'pi pi-shop',
        routerLink: ['/pos'],
        visible: this.auth.hasPermission(['admin']),
      },
      {
        label: 'Employees',
        icon: 'pi pi-user-edit',
        routerLink: ['/employees'],
        visible: this.auth.hasPermission(['admin']),
      },
      {
        label: 'User Access Control',
        icon: 'pi pi-unlock',
        routerLink: ['/user-access-control'],
        visible: this.auth.hasPermission(['admin', 'manager']),
      },
      {
        label: 'Recent Activities',
        icon: 'pi pi-hourglass',
        routerLink: ['/recent-activities'],
        visible: this.auth.hasPermission(['admin', 'manager']),
      },
      {
        label: 'Others',
        icon: 'pi pi-exclamation-circle',
        routerLink: ['/others'],
        visible: this.auth.hasPermission(['admin', 'manager']),
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        routerLink: ['/settings'],
        visible: this.auth.hasPermission(['admin', 'manager']),
      },
    ];
  }

  logout() {
    this.auth.logout().subscribe({
      next: (data: any) => {
        if (data.success) localStorage.removeItem('accessToken');
        this.router.navigate(['login']);
      },
      error: (err) => {
        console.log(err);
        localStorage.removeItem('accessToken');
        this.router.navigate(['login']);
      },
    });
  }
}
