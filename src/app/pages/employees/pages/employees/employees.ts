import { Component, inject, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { PageToolbar } from '../../../../components/common/page-toolbar/page-toolbar';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import {
  Employee,
  EmployeeQueryParams,
  EmployeeService,
} from '../../../../services/employee/employee-service';
import { CommonModule, DatePipe, isPlatformBrowser, TitleCasePipe } from '@angular/common';
import { MenuItem, MessageService } from 'primeng/api';
import { DataTable } from '../../../../components/common/data-table/data-table';
import { FormDialog } from '../../../../components/common/form-dialog/form-dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { AuthService } from '../../../../services/auth/auth-service';
import { RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';

export interface EmployeesState {
  data: Employee[];
  total: number;
  loading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-employees',
  imports: [
    PageToolbar,
    DataTable,
    CommonModule,
    FormDialog,
    InputTextModule,
    CheckboxModule,
    SelectModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    TieredMenuModule,
    RouterLink,
    TagModule,
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.scss',
  providers: [DatePipe, TitleCasePipe],
})
export class Employees implements OnInit {
  showNewEmployeeForm = false;
  showUpdateEmployeeForm = false;
  syncLoading = signal(false);
  employeesState$!: Observable<EmployeesState>;
  private messageService = inject(MessageService);
  newEmployeeForm: FormGroup;
  updateEmployeeForm: FormGroup;
  selectedEmployee: number | null = null;
  userRole: string | null = null;
  filterForm: FormGroup;

  createEmployeeInProgress = signal<boolean>(false);
  updateEmployeeInProgress = signal<boolean>(false);

  columns: any[] = [];
  currentMenuItems: MenuItem[] = [];

  roleOptions = [
    { label: 'Sales', value: 'sales' },
    { label: 'Operator', value: 'operator' },
    { label: 'Manager', value: 'manager' },
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'In-active', value: 'inactive' },
  ];

  roleSeverityMap: Record<string, any> = {
    admin: 'danger',
    manager: 'info',
    operator: 'warn',
    sales: 'success',
  };

  statusSeverityMap: Record<string, any> = {
    Active: 'success',
    Inactive: 'danger',
  };

  currentQuery: EmployeeQueryParams = {
    page: 1,
    limit: 20,
    search: '',
    sort: 'createdAt',
    order: 'desc',
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private employeeService: EmployeeService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.newEmployeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      contact_no: ['', [Validators.required, Validators.pattern(/^(\+91[-]?)?[6-9]\d{9}$/)]],
      role: [null, Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      is_active: [true],
    });

    this.updateEmployeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z\s.]+$/)]],
      contact_no: ['', [Validators.required, Validators.pattern(/^(\+91[-]?)?[6-9]\d{9}$/)]],
      role: [null, Validators.required],
      is_active: [true],
    });

    this.filterForm = this.fb.group({
      role: [null],
      status: [null],
    });
  }

  ngOnInit(): void {
    // if(!isPlatformBrowser(this.platformId)) return;
    this.loadEmployees();
    this.buildColumns();
    this.userRole = this.authService.getRole();
  }

  loadEmployees(query: EmployeeQueryParams = {}) {
    this.currentQuery = { ...this.currentQuery, ...query };
    this.employeesState$ = this.employeeService.getEmployees(this.currentQuery).pipe(
      map((res: any) => ({
        data: (res?.items ?? []).map((emp: any) => ({
          ...emp,
          createdAt: this.datePipe.transform(emp.createdAt, 'dd MMM yyyy, hh:mm a'),
          name: emp.name ?? '–',
          contact_no: emp.contact_no ?? '–',
          status: emp.is_active ? 'Active' : 'Inactive',
        })),
        total: res?.pagination?.total ?? 0,
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

  buildColumns() {
    const role = this.authService.getRole();
    const baseColumns = [
      { field: 'actions', header: 'Actions', type: 'template' },
      { field: 'id', header: 'ID', type: 'template', sortable: true },
      { field: 'name', header: 'Name', type: 'template', sortable: true },
      { field: 'role', header: 'Role', type: 'template' },
      { field: 'email', header: 'Email' },
      { field: 'contact_no', header: 'Contact No' },
      { field: 'status', header: 'Status', type: 'template' },
      { field: 'createdAt', header: 'Created At', sortable: true },
    ];

    this.columns = baseColumns;
  }

  onSearch(query: string) {
    this.loadEmployees({ search: query, page: 1 });
  }

  handleNewEmployee() {
    if (this.newEmployeeForm.invalid) {
      this.newEmployeeForm.markAllAsTouched();
      return;
    }

    this.createEmployeeInProgress.set(true);
    const payload = this.newEmployeeForm.value;
    // console.log(payload);

    this.employeeService.createEmployee(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Employee created successfully',
        });
        this.showNewEmployeeForm = false;
        this.createEmployeeInProgress.set(false);
        this.loadEmployees();
      },
      error: (err) => {
        console.log(err);
        this.createEmployeeInProgress.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? err?.message ?? 'Failed to create employee',
        });
      },
    });
  }

  handleSync() {}

  onLazyLoad(event: { page: number; pageSize: number; sortField?: string; sortOrder?: number }) {
    this.loadEmployees({
      page: event.page,
      limit: event.pageSize,
      sort: event.sortField,
      order: event.sortOrder === 1 ? 'asc' : 'desc',
    });
  }

  openRowMenu(event: Event, row: any, menu: any) {
    this.currentMenuItems = [
      { label: 'Update', icon: 'pi pi-pencil', command: () => this.openUpdateDialog(row) },
    ];

    menu.toggle(event);
  }

  openUpdateDialog(employee: any) {
    this.selectedEmployee = employee.id;
    this.updateEmployeeForm.patchValue({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      contact_no: employee.contact_no,
      role: employee.role,
      is_active: employee.is_active,
    });

    this.showUpdateEmployeeForm = true;
  }

  handleUpdateEmployee() {
    const id = this.selectedEmployee;
    if (this.updateEmployeeForm.invalid || !id) {
      this.updateEmployeeForm.markAllAsTouched();
      return;
    }
    this.updateEmployeeInProgress.set(true);
    const payload = this.updateEmployeeForm.value;
    this.employeeService.updateEmployee(id, payload).subscribe({
      next: (data: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Employee updated',
        });
        this.showUpdateEmployeeForm = false;
        this.updateEmployeeInProgress.set(false);
        this.loadEmployees();
      },
      error: (err) => {
        console.log(err);
        this.updateEmployeeInProgress.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message ?? err?.message ?? 'Something went wrong',
        });
      },
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
    this.loadEmployees({ ...filterQuery, page: 1 });
  }
  clearFilter() {
    const filterQuery = this.filterForm.getRawValue();
    if (!this.hasAnyFilterValue(filterQuery)) {
      return;
    }
    this.currentQuery = {
      page: 1,
      limit: 20,
      search: '',
    };
    this.loadEmployees(this.currentQuery);
    this.filterForm.reset();
  }

  getFilterCount(): number {
    const values = this.filterForm.getRawValue();
    return Object.values(values).filter((v) => v !== null && v !== undefined && v !== '').length;
  }

  getRoleSeverity(role: string) {
    return this.roleSeverityMap[role] ?? 'secondary';
  }

  getStatusSeverity(status: string) {
    return this.statusSeverityMap[status] ?? 'secondary';
  }
}
