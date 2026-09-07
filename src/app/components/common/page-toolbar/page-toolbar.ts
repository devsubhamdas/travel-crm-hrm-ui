import { CommonModule } from '@angular/common';
import { Component, computed, input, OnDestroy, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { FilterDropdown } from '../filter-dropdown/filter-dropdown';
import { TemplateRef } from '@angular/core';

type Option = {
  title: string;
  requireAction?: boolean;
  requireSearch?: boolean;
  requireFilter?: boolean;
  requireSync?: boolean;
};

@Component({
  selector: 'app-page-toolbar',
  imports: [
    ButtonModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    FormsModule,
    CommonModule,
    FilterDropdown,
  ],
  templateUrl: './page-toolbar.html',
  styleUrl: './page-toolbar.scss',
})
export class PageToolbar implements OnDestroy {
  visible: boolean = false;
  readonly option = input<Option>();
  readonly resolvedOptions = computed<Required<Option>>(() => ({
    title: 'Page Title',
    requireAction: true,
    requireSearch: true,
    requireFilter: true,
    requireSync: false,
    ...this.option(),
  }));
  debounceTimeOnSearch = input<number>(400);
  onActionNew = output<void>();
  onActionFilter = output<void>();
  onActionSync = output<void>();
  onSearch = output<string>();
  syncLoading = input<boolean>(false);
  search: string = '';
  private search$ = new Subject<string>();
  filterTemplate = input<TemplateRef<any>>();
  filterCount = input<number>(0);

  constructor() {
    this.search$
      .pipe(debounceTime(this.debounceTimeOnSearch()), distinctUntilChanged())
      .subscribe((value) => {
        this.onSearch.emit(value);
      });
  }

  onInput(value: string) {
    this.search = value;
    this.search$.next(value);
  }

  ngOnDestroy() {
    this.search$.complete();
  }
}
