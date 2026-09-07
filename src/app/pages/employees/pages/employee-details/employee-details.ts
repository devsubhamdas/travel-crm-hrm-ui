import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from '../../../../services/employee/employee-service';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule, CardModule, TagModule, DividerModule, SkeletonModule],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.scss',
})
export class EmployeeDetails {
  employeeId!: number;

  employee = signal<any>(null);
  loading = signal(true);

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

  constructor(
    private employeeService: EmployeeService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.employeeId = Number(this.route.snapshot.paramMap.get('id'));
    this.getEmployee();
  }

  getEmployee() {
    this.loading.set(true);

    this.employeeService.getEmployeeById(this.employeeId).subscribe({
      next: (res: any) => {
        this.employee.set(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getRoleSeverity(role: string) {
    return this.roleSeverityMap[role] ?? 'secondary';
  }

  getStatusSeverity(status: string) {
    return this.statusSeverityMap[status] ?? 'secondary';
  }
}
