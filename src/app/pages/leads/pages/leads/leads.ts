import {
  ChangeDetectorRef,
  Component,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { PageToolbar } from '../../../../components/common/page-toolbar/page-toolbar';
import { FormGroup, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormDialog } from '../../../../components/common/form-dialog/form-dialog';
import { DataTable } from '../../../../components/common/data-table/data-table';
import {
  Lead,
  LeadQueryParams,
  LeadService,
  UpdateLeadStatusPayload,
} from '../../../../services/lead/lead-service';
import { catchError, map, Observable, of, startWith, tap } from 'rxjs';
import { CommonModule, isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { MessageService, MenuItem } from 'primeng/api';
import { AuthService } from '../../../../services/auth/auth-service';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { PopoverModule } from 'primeng/popover';

export interface LeadsState {
  data: Lead[];
  total: number;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-leads',
  imports: [
    PageToolbar,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    FormDialog,
    DataTable,
    CommonModule,
    TieredMenuModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    RouterLink,
    MessageModule,
    TagModule,
    OverlayBadgeModule,
    PopoverModule,
  ],
  templateUrl: './leads.html',
  styleUrl: './leads.scss',
  providers: [DatePipe, TitleCasePipe],
})
export class Leads implements OnInit {
  columns: any[] = [];
  items: MenuItem[] = [];
  showNewLeadForm = false;
  showUpdateLeadForm = false;
  showUpdateFollowupForm = false;
  showAssignLeadForm = false;
  showUpdateStatusForm = false;

  leadsState$!: Observable<LeadsState>;
  private messageService = inject(MessageService);

  today: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  newLeadForm: FormGroup;
  updateLeadForm: FormGroup;
  filterForm: FormGroup;
  updateFollowupForm: FormGroup;
  assignLeadForm: FormGroup;
  updateStatusForm: FormGroup;

  sales = signal<any[]>([]);
  salesOptions = signal<{ label: string; id: number | null }[]>([]);
  currentMenuItems: MenuItem[] = [];
  selectedLead: any = null;
  selectedLeadId: number | null = null;
  selectedLeadStatus: string | null = null;
  selectedLeadFollowUpDate: Date | null = null;

  filteredStatusOptions = signal<any[]>([]);
  filteredSales = signal<any[]>([]);
  role: string | null = null;
  statusDialogMode: 'sales' | 'admin' = 'sales';

  isFollowUpOverdue = false;

  syncLoading = signal<boolean>(false);
  createLeadInProgress = signal<boolean>(false);
  updateLeadInProgress = signal<boolean>(false);
  updateFollowupInProgress = signal<boolean>(false);
  updateStatusInProgress = signal<boolean>(false);

  sourceTypeOptions = [
    { label: 'Manual', value: 'manual' },
    { label: 'Walk-in', value: 'walk_in' },
    { label: 'Referral', value: 'referral' },
    { label: 'WhatsApp', value: 'whatsapp' },
    { label: 'Call', value: 'call' },
    { label: 'Email', value: 'email' },
    { label: 'Media Ad', value: 'media_ad' },
    { label: 'Social Ad', value: 'social_ad' },
    { label: 'Twak.to', value: 'twak_to' },
    { label: 'Datasheet', value: 'datasheet' },
  ];

  sourceTypeFilterOptions = [
    { label: 'Trip Lead', value: 'trip_lead' },
    { label: 'Enquiry', value: 'enquiry' },
    { label: 'Itinerary', value: 'itinerary' },
    { label: 'Contact', value: 'contact' },
    ...this.sourceTypeOptions,
  ];

  statusOptions = [
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Qualified', value: 'qualified' },
    { label: 'Quoted', value: 'quoted' },
    { label: 'Negotiation', value: 'negotiation' },
    { label: 'Booking In Progress', value: 'booking_in_progress' },
    { label: 'Converted', value: 'converted' },
    { label: 'Lost', value: 'lost' },
    { label: 'Closed', value: 'closed' },
  ];

  statusFilterOptions = [{ label: 'New', value: 'new' }, ...this.statusOptions];

  followUpStatusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Follow-up Needed', value: 'follow_up_needed' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Completed', value: 'completed' },
    { label: 'Not Required', value: 'not_required' },
  ];

  departureTypeOptions = [
    { label: 'Fixed', value: 'fixed' },
    { label: 'Customized', value: 'customized' },
    { label: 'Others', value: 'others' },
  ];

  statusSeverityMap: Record<string, any> = {
    new: 'info',
    contacted: 'info',
    qualified: 'warn',
    quoted: 'info',
    negotiation: 'warn',
    booking_in_progress: 'contrast',
    converted: 'success',
    lost: 'danger',
    closed: 'secondary',
  };

  followUpSeverityMap: Record<string, any> = {
    pending: 'secondary',
    follow_up_needed: 'warn',
    scheduled: 'info',
    completed: 'success',
    not_required: 'secondary',
  };

  currentQuery: LeadQueryParams = {
    page: 1,
    pageSize: 20,
    search: '',
    sort: 'created_at',
    order: 'desc',
  };

  constructor(
    private authService: AuthService,
    private leadService: LeadService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private titleCasePipe: TitleCasePipe,
  ) {
    this.newLeadForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      contact_no: ['', [Validators.required, Validators.pattern(/^(\+91[-]?)?[6-9]\d{9}$/)]],
      destination: ['', Validators.required],
      travel_date: [null, Validators.required],
      travellers_count: [null, [Validators.required, Validators.min(1)]],
      budget: ['', Validators.required],
      source_type: ['manual'],
      departure_type: ['', Validators.required],
      remark: ['', Validators.required],
    });

    this.updateLeadForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      contact_no: ['', [Validators.required, Validators.pattern(/^(\+91[-]?)?[6-9]\d{9}$/)]],
      destination: ['', Validators.required],
      travel_date: [null, Validators.required],
      travellers_count: [null, [Validators.required, Validators.min(1)]],
      budget: ['', Validators.required],
      source_type: [''],
      departure_type: ['', Validators.required],
      remark: ['', Validators.required],
    });

    this.filterForm = this.fb.group({
      status: [''],
      assignedAgentId: [null],
      source: [''],
      departure_type: [''],
    });

    this.updateFollowupForm = this.fb.group({
      followUpStatus: [null, Validators.required],
      followUpDate: [null],
      note: [null, Validators.required],
    });

    this.assignLeadForm = this.fb.group({
      assignedAgentId: [null, Validators.required],
      followupDate: [null, Validators.required],
      note: [''],
    });

    this.updateStatusForm = this.fb.group({
      status: [null, Validators.required],
      followUpStatus: [null],
      followUpDate: [null],
      note: [''],
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.role = this.authService.getRole();
    this.buildColumns();
    this.getSalesUsers();
    this.loadLeads();

    this.updateFollowupForm.get('followUpStatus')?.valueChanges.subscribe((status) => {
      this.onFollowUpStatusChange(status);
    });

    this.updateStatusForm.get('status')?.valueChanges.subscribe((status) => {
      this.onStatusChange(status);
    });

    this.updateStatusForm.get('followUpStatus')?.valueChanges.subscribe((status) => {
      this.onStatusFollowUpChange(status);
    });
  }

  loadLeads(query: LeadQueryParams = {}) {
    this.currentQuery = { ...this.currentQuery, ...query };

    this.leadsState$ = this.leadService.getLeads(this.currentQuery).pipe(
      tap(() => {}),
      map((res: any) => ({
        data: (res?.data ?? []).map((lead: any) => ({
          ...lead,
          assigned_agent_name: lead.assigned_agent_name || '–',
          remark: lead.remark || '–',
          destination: lead.destination || '–',
          raw_travel_date: lead.travel_date,
          raw_follow_up_date: lead.follow_up_date,

          travel_date: lead.travel_date
            ? this.datePipe.transform(lead.travel_date, 'dd MMM yyyy')
            : '–',
          follow_up_date: lead.follow_up_date
            ? this.datePipe.transform(lead.follow_up_date, 'dd MMM yyyy')
            : '–',
          created_at: this.datePipe.transform(lead.created_at, 'dd MMM yyyy, hh:mm a'),
          updated_at: this.datePipe.transform(lead.updated_at, 'dd MMM yyyy, hh:mm a'),
        })),
        total: res?.meta?.total ?? 0,
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
          const salesOptions = this.sales().map((item) => ({
            label: item.name,
            id: Number(item.id),
          }));
          this.salesOptions.set(salesOptions);
        }
      },
      error: (err) => console.log(err),
    });
  }

  onLazyLoad(event: { page: number; pageSize: number; sortField?: string; sortOrder?: number }) {
    this.loadLeads({
      page: event.page,
      pageSize: event.pageSize,
      sort: event.sortField,
      order: event.sortOrder === 1 ? 'asc' : 'desc',
    });
  }

  buildColumns() {
    const baseColumns = [
      { field: 'actions', header: 'Actions', type: 'template' },
      { field: 'id', header: 'ID', type: 'template', sortable: true },
      { field: 'lead_code', header: 'Lead Code', type: 'template', sortable: true },
      { field: 'name', header: 'Name', sortable: true },
      { field: 'contact_no', header: 'Contact No' },
      this.role === 'admin' && { field: 'assigned_agent_name', header: 'Assigned Agent' },
      { field: 'email', header: 'Email' },
      { field: 'destination', header: 'Destination', sortable: true },
      { field: 'travel_date', header: 'Travel Date', sortable: true },
      { field: 'travellers_count', header: 'Travellers' },
      { field: 'budget', header: 'Budget', sortable: true },
      { field: 'departure_type', header: 'Departure' },
      { field: 'source_type', header: 'Source' },
      { field: 'status', header: 'Status', type: 'template' },
      { field: 'follow_up_status', header: 'Follow-up Status', type: 'template' },
      { field: 'follow_up_date', header: 'Follow-up Date', sortable: true },
      { field: 'remark', header: 'Remark', type: 'template' },
      { field: 'created_at', header: 'Created At', sortable: true },
      { field: 'updated_at', header: 'Updated At', sortable: true },
    ].filter(Boolean);

    this.columns = baseColumns;
  }

  openUpdateDialog(lead: any) {
    this.selectedLead = lead;
    this.updateLeadForm.patchValue({
      ...lead,
      source_type: String(lead.source_type || '').toLowerCase(),
      travel_date: lead.raw_travel_date ? new Date(lead.raw_travel_date) : null,
      follow_up_date: lead.raw_follow_up_date ? new Date(lead.raw_follow_up_date) : null,
    });

    this.filteredStatusOptions.set(this.statusOptions.filter((opt) => opt.value !== lead.status));
    this.filteredSales.set(this.sales().filter((user) => user.id !== lead.assigned_agent_id));

    this.showUpdateLeadForm = true;
  }

  handleNewLead() {
    if (this.newLeadForm.invalid) {
      this.newLeadForm.markAllAsTouched();
      return;
    }

    this.createLeadInProgress.set(true);

    const otherSources = ['trip_lead', 'itinerary', 'enquiry', 'contact'];
    const sourceType = this.newLeadForm.value.source_type;

    const payload = {
      ...this.newLeadForm.value,
      source: otherSources.includes(sourceType) ? sourceType : 'manual',
      travel_date: this.newLeadForm.value.travel_date
        ? this.toLocalDate(this.newLeadForm.value.travel_date as Date)
        : undefined,
      follow_up_date: this.newLeadForm.value.follow_up_date
        ? this.toLocalDate(this.newLeadForm.value.follow_up_date as Date)
        : undefined,
    };

    this.leadService.createLead(payload).subscribe({
      next: (data: any) => {
        this.showNewLeadForm = false;
        this.createLeadInProgress.set(false);
        this.newLeadForm.reset({
          source: 'Manual',
          status: 'new',
          follow_up_status: 'pending',
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: data?.message ?? 'Lead created successfully',
        });
        this.loadLeads();
      },
      error: (err) => {
        console.log(err);
        this.createLeadInProgress.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? err.message ?? 'Something went wrong',
        });
      },
    });
  }

  handleUpdateLead() {
    const leadId = this.selectedLead?.id;
    if (this.updateLeadForm.invalid || !leadId) {
      this.updateLeadForm.markAllAsTouched();
      return;
    }

    this.updateLeadInProgress.set(true);

    const payload = {
      ...this.updateLeadForm.value,
      travel_date: this.updateLeadForm.value.travel_date
        ? this.toLocalDate(this.updateLeadForm.value.travel_date as Date)
        : undefined,
      follow_up_date: this.updateLeadForm.value.follow_up_date
        ? this.toLocalDate(this.updateLeadForm.value.follow_up_date as Date)
        : undefined,
    };

    this.leadService.updateLead(leadId, payload).subscribe({
      next: () => {
        this.showUpdateLeadForm = false;
        this.updateLeadInProgress.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Lead updated successfully',
        });
        this.loadLeads();
      },
      error: (err) => {
        console.log(err);
        this.updateLeadInProgress.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || err?.message || 'Something went wrong',
        });
      },
    });
  }

  handleDeleteLead() {}

  handleAssignLead() {
    const leadId = this.selectedLeadId;
    if (this.assignLeadForm.invalid || !leadId) {
      this.assignLeadForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.assignLeadForm.value,
      followupDate: this.toLocalDate(this.assignLeadForm.value.followupDate),
    };

    this.leadService.assignLead(leadId, payload).subscribe({
      next: (data: any) => {
        this.showAssignLeadForm = false;
        this.assignLeadForm.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail:
            (`Lead assigned to ${this.titleCasePipe.transform(data?.data?.assigned_agent_name)}` ||
              data?.message) ??
            'Success',
        });
        this.loadLeads();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message ?? err?.message ?? 'Something went wrong',
        });
      },
    });
  }

  private isDateInPast(value: any): boolean {
    if (!value) return false;
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    return date.getTime() < new Date().getTime();
  }

  private applyFollowupNoteValidation(): void {
    const noteControl = this.updateFollowupForm.get('note');
    if (!noteControl) return;

    if (this.isFollowUpOverdue) {
      noteControl.setValidators([Validators.required]);
    } else {
      noteControl.setValidators([Validators.required]);
    }

    noteControl.updateValueAndValidity();
  }

  private openUpdateFollowupDialog(row: any): void {
    this.selectedLeadId = Number(row.id);
    this.selectedLeadFollowUpDate = row.raw_follow_up_date
      ? new Date(row.raw_follow_up_date)
      : null;
    this.isFollowUpOverdue = this.isDateInPast(row.raw_follow_up_date);

    this.updateFollowupForm.patchValue({
      followUpStatus: row.follow_up_status ?? null,
      followUpDate: row.raw_follow_up_date ? new Date(row.raw_follow_up_date) : null,
      note: null,
    });

    this.onFollowUpStatusChange(this.updateFollowupForm.get('followUpStatus')?.value);
    this.applyFollowupNoteValidation();
    this.showUpdateFollowupForm = true;
  }

  handleUpdateFollowup() {
    const id = this.selectedLeadId;
    const noteControl = this.updateFollowupForm.get('note');

    this.applyFollowupNoteValidation();

    if (this.isFollowUpOverdue && !noteControl?.value?.trim()) {
      noteControl?.markAsTouched();
      noteControl?.updateValueAndValidity();

      this.messageService.add({
        severity: 'warn',
        summary: 'Note Required',
        detail: 'Please explain the missed follow-up before rescheduling.',
      });
      return;
    }

    if (
      this.updateFollowupForm.invalid ||
      this.updateFollowupForm.value.followUpStatus === 'pending' ||
      !id
    ) {
      this.updateFollowupForm.markAllAsTouched();
      return;
    }

    this.updateFollowupInProgress.set(true);

    const payload = {
      ...this.updateFollowupForm.value,
      followUpDate: this.updateFollowupForm.value.followUpDate
        ? this.toLocalDate(this.updateFollowupForm.value.followUpDate)
        : null,
      note: this.updateFollowupForm.value.note?.trim() || null,
    };

    this.leadService.updateFollowup(id, payload).subscribe({
      next: (data: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: data?.message ?? 'Lead follow-up updated',
        });

        this.showUpdateFollowupForm = false;
        this.isFollowUpOverdue = false;
        this.selectedLeadFollowUpDate = null;
        this.selectedLeadId = null;

        this.updateFollowupForm.reset({
          followUpStatus: null,
          followUpDate: null,
          note: '',
        });

        this.updateFollowupInProgress.set(false);
        this.applyFollowupNoteValidation();
        this.loadLeads();
      },
      error: (err) => {
        console.log(err);
        this.updateFollowupInProgress.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? err.message ?? 'Something went wrong',
        });
      },
    });
  }

  isReopeningLostOrClosed(currentStatus: string | null, nextStatus: string | null): boolean {
    return (
      ['lost', 'closed'].includes(String(currentStatus || '').toLowerCase()) &&
      !['lost', 'closed'].includes(String(nextStatus || '').toLowerCase()) &&
      String(currentStatus || '').toLowerCase() !== String(nextStatus || '').toLowerCase()
    );
  }

  isClosingOrLosing(nextStatus: string | null): boolean {
    return ['lost', 'closed'].includes(String(nextStatus || '').toLowerCase());
  }

  private applyStatusFormValidation(): void {
    const status = this.updateStatusForm.get('status')?.value;
    const noteControl = this.updateStatusForm.get('note');
    const followUpStatusControl = this.updateStatusForm.get('followUpStatus');
    const followUpDateControl = this.updateStatusForm.get('followUpDate');

    if (!noteControl || !followUpStatusControl || !followUpDateControl) return;

    noteControl.clearValidators();
    followUpStatusControl.clearValidators();
    followUpDateControl.clearValidators();

    const reopening = this.isReopeningLostOrClosed(this.selectedLeadStatus, status);
    const closingOrLosing = this.isClosingOrLosing(status);

    if (this.statusDialogMode === 'sales' && closingOrLosing) {
      noteControl.setValidators([Validators.required]);
    }

    if (this.statusDialogMode === 'admin' && reopening) {
      noteControl.setValidators([Validators.required]);
      followUpStatusControl.setValidators([Validators.required]);

      if (this.updateStatusForm.get('followUpStatus')?.value === 'scheduled') {
        followUpDateControl.setValidators([Validators.required]);
      }
    }

    noteControl.updateValueAndValidity();
    followUpStatusControl.updateValueAndValidity();
    followUpDateControl.updateValueAndValidity();
  }

  private openUpdateStatusDialog(row: any): void {
    this.selectedLeadId = Number(row.id);
    this.selectedLead = row;
    this.selectedLeadStatus = row.status;
    this.statusDialogMode = this.role === 'admin' ? 'admin' : 'sales';

    this.updateStatusForm.reset({
      status: null,
      followUpStatus: null,
      followUpDate: null,
      note: '',
    });

    this.applyStatusFormValidation();
    this.showUpdateStatusForm = true;
  }

  onStatusChange(status: string | null): void {
    const reopening = this.isReopeningLostOrClosed(this.selectedLeadStatus, status);

    if (!reopening) {
      this.updateStatusForm.patchValue(
        {
          followUpStatus: null,
          followUpDate: null,
        },
        { emitEvent: false },
      );
    }

    if (this.isClosingOrLosing(status)) {
      this.updateStatusForm.patchValue(
        {
          followUpStatus: 'not_required',
          followUpDate: null,
        },
        { emitEvent: false },
      );
    }

    this.applyStatusFormValidation();
  }

  onStatusFollowUpChange(status: string | null): void {
    const followUpDateControl = this.updateStatusForm.get('followUpDate');
    if (!followUpDateControl) return;

    followUpDateControl.clearValidators();

    if (status === 'scheduled') {
      followUpDateControl.setValidators([Validators.required]);
    }

    followUpDateControl.updateValueAndValidity();
    this.applyStatusFormValidation();
  }

  handleSubmitLeadStatus(): void {
    const id = this.selectedLeadId;
    if (!id) return;

    this.applyStatusFormValidation();

    if (this.updateStatusForm.invalid) {
      this.updateStatusForm.markAllAsTouched();
      return;
    }

    const payload: UpdateLeadStatusPayload = {
      status: this.updateStatusForm.value.status,
      note: this.updateStatusForm.value.note?.trim() || undefined,
      followUpStatus: this.updateStatusForm.value.followUpStatus || undefined,
      followUpDate: this.updateStatusForm.value.followUpDate
        ? this.toLocalDate(this.updateStatusForm.value.followUpDate)
        : null,
    };

    this.updateStatusInProgress.set(true);

    const req$ =
      this.role === 'admin'
        ? this.leadService.adminUpdateLeadStatus(id, payload)
        : this.leadService.updateLeadStatus(id, payload);

    req$.subscribe({
      next: (data: any) => {
        this.updateStatusInProgress.set(false);
        this.showUpdateStatusForm = false;
        this.selectedLeadId = null;
        this.selectedLead = null;
        this.selectedLeadStatus = null;

        this.updateStatusForm.reset({
          status: null,
          followUpStatus: null,
          followUpDate: null,
          note: '',
        });

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: data?.message ?? 'Lead status updated successfully',
        });

        this.loadLeads();
      },
      error: (err) => {
        this.updateStatusInProgress.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message ?? err?.message ?? 'Something went wrong',
        });
      },
    });
  }

  onSearch(query: string) {
    this.loadLeads({ search: query, page: 1 });
  }

  handleAction(toggle: boolean) {
    this.showNewLeadForm = toggle;
  }

  openRowMenu(event: Event, row: any, menu: any) {
    const role = this.authService?.getRole();

    if (role === 'admin') {
      this.currentMenuItems = [
        { label: 'Update', icon: 'pi pi-pencil', command: () => this.openUpdateDialog(row) },
        {
          label: 'Update Lead Status',
          icon: 'pi pi-sync',
          command: () => this.openUpdateStatusDialog(row),
        },
        { label: 'Delete', icon: 'pi pi-trash', command: () => this.handleDeleteLead() },
        {
          label: 'Assign',
          icon: 'pi pi-user-plus',
          command: () => {
            this.selectedLeadId = row.id;
            this.selectedLead = row;
            this.assignLeadForm.reset();
            this.assignLeadForm.patchValue({
              assignedAgentId: row.assigned_agent_id ? Number(row.assigned_agent_id) : null,
              followupDate: row.raw_follow_up_date ? new Date(row.raw_follow_up_date) : null,
            });
            this.showAssignLeadForm = true;
          },
        },
      ];
    } else if (role === 'sales') {
      this.currentMenuItems = [
        { label: 'Update', icon: 'pi pi-pencil', command: () => this.openUpdateDialog(row) },
        {
          label: 'Update Lead Status',
          icon: 'pi pi-circle',
          command: () => this.openUpdateStatusDialog(row),
        },
        {
          label: 'Update Follow-up',
          icon: 'pi pi-calendar-plus',
          command: () => this.openUpdateFollowupDialog(row),
        },
      ];
    } else if (role === 'operator') {
      this.currentMenuItems = [
        { label: 'Update', icon: 'pi pi-pencil', command: () => this.openUpdateDialog(row) },
      ];
    }

    menu.toggle(event);
  }

  onAgentSelect(event: { value: number }) {
    const agent = this.sales().find((s) => s.id === event.value);
    this.newLeadForm.patchValue({
      assigned_agent_name: agent?.name ?? '',
    });
  }

  onUpdateAgentSelect(event: { value: number }) {
    const agent = this.sales().find((s) => s.id === event.value);
    this.updateLeadForm.patchValue({ assigned_agent_name: agent?.name ?? '' });
  }

  handleSync() {
    this.syncLoading.set(true);
    this.leadService.syncAll().subscribe({
      next: (data: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: data.message || 'All data synced',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || err?.message || 'something went wrong',
        });
      },
      complete: () => this.syncLoading.set(false),
    });
  }

  private hasAnyFilterValue(values: any): boolean {
    return Object.values(values).some((v) => v !== null && v !== undefined && v !== '');
  }

  applyFilter() {
    const filterQuery = this.filterForm.getRawValue();
    if (!this.hasAnyFilterValue(filterQuery)) {
      return;
    }
    this.loadLeads({ ...filterQuery, page: 1 });
  }

  clearFilter() {
    const filterQuery = this.filterForm.getRawValue();
    if (!this.hasAnyFilterValue(filterQuery)) {
      return;
    }
    this.filterForm.reset();
    this.currentQuery = {
      page: 1,
      pageSize: 20,
      search: '',
      sort: 'created_at',
      order: 'desc',
    };
    this.loadLeads(this.currentQuery);
  }

  getFilterCount(): number {
    const values = this.filterForm.getRawValue();
    return Object.values(values).filter((v) => v !== null && v !== undefined && v !== '').length;
  }

  toLocalDate(raw: Date) {
    const d = new Date(raw);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` || null;
  }

  private onFollowUpStatusChange(status: string | null) {
    const control = this.updateFollowupForm.get('followUpDate');
    if (!control) return;

    if (status === 'scheduled') {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
    }

    control.updateValueAndValidity();
  }

  getStatusSeverity(status: string) {
    return this.statusSeverityMap[status] ?? 'secondary';
  }

  getFollowUpSeverity(status: string) {
    return this.followUpSeverityMap[status] ?? 'secondary';
  }
}
