import { NgTemplateOutlet } from '@angular/common';
import { Component, HostListener, Input, TemplateRef, ViewChild } from '@angular/core';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-filter-dropdown',
  imports: [NgTemplateOutlet, MenuModule],
  templateUrl: './filter-dropdown.html',
  styleUrl: './filter-dropdown.scss',
})
export class FilterDropdown {
  @ViewChild('dropdown') dropdown!: any;

  @Input() contentTemplate?: TemplateRef<any>;

  open(event: Event) {
    this.dropdown.toggle(event);
  }

  close() {
    this.dropdown.hide();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const isInsidePrimeOverlay =
      target.closest('.p-datepicker-panel') ||
      target.closest('.p-overlay') ||
      target.closest('.p-select-overlay') ||
      target.closest('[data-pc-section="panel"]');

    if (isInsidePrimeOverlay) {
      event.stopImmediatePropagation();
    }
  }
}
