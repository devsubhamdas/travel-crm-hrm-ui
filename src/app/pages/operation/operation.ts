import { Component } from '@angular/core';
import { PageMenubar } from '../../components/core/page-menubar/page-menubar';
import { MenuItem } from 'primeng/api';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-operation',
  imports: [PageMenubar, RouterOutlet],
  templateUrl: './operation.html',
  styleUrl: './operation.scss',
})
export class Operation {
  menuItems: MenuItem[] = [
    {
      label: 'Bookings',
      routerLink: ['/operations/manage-bookings'],
    },
    {
      label: 'Ticket issue',
      routerLink: ['/operations/manage-ticket-issues'],
    },
    {
      label: 'Booking Follow-ups',
      routerLink: ['/operations/manage-booking-follow-ups'],
    },
    {
      label: 'Customer Documents',
      routerLink: ['/operations/manage-customer-documents'],
    },
  ];
}
