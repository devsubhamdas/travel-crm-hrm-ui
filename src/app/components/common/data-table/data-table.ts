import {
  AfterContentInit,
  Component,
  ContentChildren,
  Input,
  input,
  OnInit,
  output,
  QueryList,
} from '@angular/core';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ContentChild, TemplateRef } from '@angular/core';
import { NgTemplateOutlet, NgClass } from '@angular/common';

interface Column {
  field: string;
  header: string;
  type?: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  imports: [TableModule, SkeletonModule, NgTemplateOutlet],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable implements OnInit, AfterContentInit {
  @ContentChildren(TemplateRef) templates!: QueryList<TemplateRef<any>>;
  columns = input.required<Column[]>();
  data = input.required<unknown[]>();
  totalRecords = input<number>(0);
  rows = input<number>(20);
  loading = input<boolean>(false);
  lazyLoad = output<{ page: number; pageSize: number; sortField?: string; sortOrder?: number }>();
  templateMap: Record<string, TemplateRef<any>> = {};
  @Input() rowClassFn?: (row: any) => string;
  sortField = input<string>('');
  sortOrder = input<number>(1); // 1 = asc, -1 = desc

  ngOnInit(): void {}

  ngAfterContentInit() {
    this.templates.forEach((tpl: any) => {
      const name = tpl._declarationTContainer?.localNames?.[0];
      if (name) {
        this.templateMap[name] = tpl;
      }
    });
  }

  getTemplate(field: string) {
    return this.templateMap[field];
  }

  // dummy rows to drive skeleton — same count as rows()
  get skeletonRows() {
    return Array(this.rows()).fill({});
  }

  onLazyLoad(event: TableLazyLoadEvent) {
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 20)) + 1;
    const pageSize = event.rows ?? 20;
    this.lazyLoad.emit({
      page,
      pageSize,
      sortField: (event.sortField as string) ?? undefined,
      sortOrder: event.sortOrder ?? undefined,
    });
  }
}
