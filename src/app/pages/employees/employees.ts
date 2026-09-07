import { Component } from '@angular/core';
import { PageMenubar } from '../../components/core/page-menubar/page-menubar';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-employees',
  imports: [PageMenubar, RouterOutlet],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
})
export class Employees {
  menuItems: MenuItem[] = [
    {
      label: 'Employees',
      routerLink: '/employees/manage-employees',
    },
    {
      label: 'Task',
      routerLink: '/employees/manage-tasks',
    },
  ];
}
