import { Component, OnInit } from '@angular/core';
import { PageMenubar } from '../../components/core/page-menubar/page-menubar';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'app-leads',
  imports: [PageMenubar, RouterOutlet],
  templateUrl: './leads.html',
  styleUrl: './leads.scss',
})
export class Leads implements OnInit {
  menuItems: MenuItem[] = [];
  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.initMenuItems();
  }

  private initMenuItems() {
    this.menuItems = [
      {
        label: 'Leads',
        routerLink: ['/leads/manage-leads'],
      },
      {
        label: 'Customers',
        routerLink: ['/leads/manage-customers'],
      },
      {
        label: 'Enquiries',
        routerLink: ['/leads/manage-enquiries'],
      },
      {
        label: 'Follow-ups',
        routerLink: ['/leads/manage-follow-ups'],
        visible: this.auth.hasPermission(['admin', 'sales', 'manager']),
      },
      {
        label: 'Communication Logs',
        routerLink: ['/leads/manage-communication-logs'],
      },
    ];
  }
}
