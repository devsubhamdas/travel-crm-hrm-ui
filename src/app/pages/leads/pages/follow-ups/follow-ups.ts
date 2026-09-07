import { Component, OnInit, signal } from '@angular/core';
import { PageToolbar } from '../../../../components/common/page-toolbar/page-toolbar';
import { LeadFollowupQueryParams, LeadService } from '../../../../services/lead/lead-service';
import { DataTable } from '../../../../components/common/data-table/data-table';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormDialog } from '../../../../components/common/form-dialog/form-dialog';
import { catchError, map, Observable, of, startWith, tap } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../../services/auth/auth-service';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoFocus } from 'primeng/autofocus';
import { TagModule } from 'primeng/tag';
import { PopoverModule } from 'primeng/popover';

export interface FollowupState {
  data: any[];
  total: number;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-follow-ups',
  imports: [
    PageToolbar,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DataTable,
    CommonModule,
    TieredMenuModule,
    FormDialog,
    TextareaModule,
    SelectModule,
    MessageModule,
    DatePickerModule,
    AutoFocus,
    TagModule,
    PopoverModule,
  ],
  templateUrl: './follow-ups.html',
  styleUrl: './follow-ups.scss',
  providers: [DatePipe],
})
export class FollowUps implements OnInit {
  followupState$!: Observable<FollowupState>;
  columns: any[] = [];
  addNoteForm: FormGroup;
  showAddNoteForm = false;
  selectedRow: number | null = null;
  filterForm: FormGroup;
  sales = signal<any[]>([]);
  role: string | null = null;

  statusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Rescheduled', value: 'rescheduled' },
    { label: 'Done', value: 'done' },
    { label: 'Missed', value: 'missed' },
  ];

  statusSeverityMap: Record<string, any> = {
    pending: 'warn',
    rescheduled: 'info',
    done: 'success',
    missed: 'danger',
  };

  currentQuery: LeadFollowupQueryParams = {
    page: 1,
    pageSize: 20,
    search: '',
    sort: 'created_at',
    order: 'desc',
  };

  constructor(
    private leadService: LeadService,
    private messageService: MessageService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
  ) {
    this.addNoteForm = this.fb.group({
      note: ['', Validators.required],
    });
    this.filterForm = this.fb.group({
      status: [''],
      assigned_agent_id: [null],
      follow_up_date: [''],
    });
  }

  currentMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.buildColumns();
    this.loadFollowups();
  }

  loadFollowups(query: LeadFollowupQueryParams = {}) {
    this.currentQuery = { ...this.currentQuery, ...query };
    this.followupState$ = this.leadService.getLeadFollowups(this.currentQuery).pipe(
      tap((res) => {
        if (!this.sales().length) {
          this.getSalesUsers();
        }
      }),
      map((res: any) => ({
        data: (res?.data?.followups ?? []).map((followup: any) => ({
          ...followup,

          // keep bigint-safe numeric conversion
          id: Number(followup.id),
          lead_id: Number(followup.lead_id),

          customer_name: followup.leads?.name || '–',
          customer_contact_no: followup.leads?.contact_no || '–',
          customer_email: followup.leads?.email || '–',
          destination: followup.leads?.destination || '–',
          note: followup.note || '–',

          raw_follow_up_date: followup.follow_up_date,
          isOverdue: this.isFollowUpOverdue(followup),

          follow_up_date: this.datePipe.transform(followup.follow_up_date, 'dd MMM yyyy') || '–',
          created_at: this.datePipe.transform(followup.created_at, 'dd MMM yyyy, hh:mm a'),
          updated_at: this.datePipe.transform(followup.updated_at, 'dd MMM yyyy, hh:mm a'),
          rowClass: this.isFollowUpOverdue(followup) ? 'followup-row-overdue' : '',
        })),
        total: res?.data?.meta?.total ?? 0,
        loading: false,
        error: null,
      })),
      catchError((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? err.message ?? 'Something went wrong',
        });
        return of({
          data: [],
          total: 0,
          loading: false,
          error: err.error?.message ?? err.message ?? 'Something went wrong',
        });
      }),
      startWith({ data: [], total: 0, loading: true, error: null }),
    );
  }

  getSalesUsers() {
    if (this.sales().length) return;

    this.authService.getUserByRole('sales').subscribe({
      next: (data: any) => {
        if (data.success) {
          this.sales.set(data.data);
        }
      },
      error: (err) => console.log(err),
    });
  }

  buildColumns() {
    const baseColumns = [
      { field: 'id', header: 'ID', sortable: true },
      { field: 'lead_id', header: 'Lead ID', sortable: true },
      { field: 'follow_up_date', header: 'Followup Date', sortable: true },
      { field: 'status', header: 'Status', type: 'template' },
      { field: 'customer_name', header: 'Customer Name', sortable: true },
      { field: 'customer_email', header: 'Customer Email' },
      { field: 'customer_contact_no', header: 'Contact No.' },
      { field: 'destination', header: 'Destination', sortable: true },
      { field: 'note', header: 'Note', type: 'template' },
      { field: 'created_at', header: 'Created At', sortable: true },
      { field: 'updated_at', header: 'Updated At', sortable: true },
    ];

    this.columns = baseColumns;
  }

  // NEW
  isFollowUpOverdue(row: any): boolean {
    if (!row?.follow_up_date) return false;

    const followUpDate = new Date(row.follow_up_date);
    if (isNaN(followUpDate.getTime())) return false;

    return (
      followUpDate.getTime() < new Date().getTime() && String(row.status).toLowerCase() !== 'done'
    );
  }

  // optional helper if your table supports rowClass callback/input
  // NEW
  getRowClass(row: any): string {
    return row?.isOverdue ? 'followup-row-overdue' : '';
  }

  onLazyLoad(event: { page: number; pageSize: number; sortField?: string; sortOrder?: number }) {
    this.loadFollowups({
      page: event.page,
      pageSize: event.pageSize,
      sort: event.sortField,
      order: event.sortOrder === 1 ? 'asc' : 'desc',
    });
  }

  openRowMenu(event: Event, row: any, menu: any) {
    this.currentMenuItems = [
      {
        label: 'Add Note',
        icon: 'pi pi-pen-to-square',
        command: () => this.openAddNoteForm(Number(row.id)),
      },
    ];

    menu.toggle(event);
  }

  openAddNoteForm(id: number) {
    this.selectedRow = Number(id);
    this.addNoteForm.patchValue({ note: '' });
    this.addNoteForm.updateValueAndValidity();
    this.showAddNoteForm = true;
  }

  handleAddNote() {
    const id = this.selectedRow;

    if (this.addNoteForm.invalid || !id) {
      this.addNoteForm.markAllAsTouched();
      return;
    }

    const payload = {
      note: this.addNoteForm.value.note?.trim(),
    };

    this.leadService.addFollowupNote(id, payload).subscribe({
      next: (data: any) => {
        if (data.success) {
          this.showAddNoteForm = false;
          this.addNoteForm.patchValue({ note: '' });
          this.addNoteForm.updateValueAndValidity();

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Note added and follow-up completed',
          });

          this.loadFollowups();
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || err?.message || 'Something went wrong',
        });
      },
    });
  }

  onSearch(query: string) {
    this.loadFollowups({ search: query, page: 1 });
  }

  private hasAnyFilterValue(values: any): boolean {
    return Object.values(values).some((v) => v !== null && v !== undefined && v !== '');
  }

  applyFilter() {
    const raw = this.filterForm.getRawValue();
    if (!this.hasAnyFilterValue(raw)) return;

    const filterQuery: LeadFollowupQueryParams = {
      status: raw.status,
      assignedAgentId: raw.assigned_agent_id,
      followupDate: raw.follow_up_date ? this.toLocalDate(raw.follow_up_date)! : undefined,
      page: 1,
    };

    this.loadFollowups(filterQuery);
  }

  clearFilter() {
    const raw = this.filterForm.getRawValue();

    // if already empty → do nothing
    if (!this.hasAnyFilterValue(raw)) return;

    this.filterForm.reset();

    this.currentQuery = {
      page: 1,
      pageSize: 20,
      search: '',
    };

    this.loadFollowups(this.currentQuery);
  }

  getFilterCount(): number {
    const values = this.filterForm.getRawValue();
    return Object.values(values).filter((v) => v !== null && v !== undefined && v !== '').length;
  }

  toLocalDate(raw: Date) {
    const d = new Date(raw);
    // Build a date string in local time, no UTC shift
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` || null; // "2026-04-03"
  }

  getStatusSeverity(status: string) {
    return this.statusSeverityMap[status?.toLowerCase()] ?? 'secondary';
  }
}
