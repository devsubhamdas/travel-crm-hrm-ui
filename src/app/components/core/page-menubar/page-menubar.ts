import { Component, input } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-page-menubar',
  imports: [MenubarModule],
  templateUrl: './page-menubar.html',
  styleUrl: './page-menubar.scss',
})
export class PageMenubar {
  menuItems = input.required<MenuItem[]>();
}
