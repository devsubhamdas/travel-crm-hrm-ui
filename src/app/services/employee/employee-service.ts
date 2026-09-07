import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Employee {
  id: number;
  name: string;
  contact_no: string;
  email: string;
  is_active?: boolean;
  role?: string;
  assigned_leads_count?: number;
  createdAt?: string;
}
export interface CreateEmployee {
  name: string;
  contact_no: string;
  email: string;
  password: string;
  is_active?: boolean;
  role?: string;
}
type UpdateEmployee = Omit<CreateEmployee, 'password'>;

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEmployees(query: EmployeeQueryParams = {}) {
    let params = new HttpParams();

    if (query.page) params = params.set('page', String(query.page));
    if (query.limit) params = params.set('limit', String(query.limit));
    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.role) params = params.set('role', query.role);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.order) params = params.set('order', query.order);

    return this.http.get(`${this.apiUrl}/crm/employees`, { params });
  }

  createEmployee(payload: CreateEmployee) {
    return this.http.post(`${this.apiUrl}/crm/employees`, payload);
  }

  updateEmployee(id: number, payload: UpdateEmployee) {
    return this.http.patch(`${this.apiUrl}/crm/employees/${id}`, payload);
  }

  getEmployeeById(id: number) {
    return this.http.get(`${this.apiUrl}/crm/employees/${id}`);
  }
}
