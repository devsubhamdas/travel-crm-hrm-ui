import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Lead {
  id: number;
  lead_code?: string;
  name: string;
  email?: string;
  contact_no?: string;
  destination?: string;
  travel_date?: string;
  travellers_count?: number;
  budget?: number;
  source?: string;
  source_type?: string;
  departure_type?: string;
  status?: string;
  assigned_agent_id?: number | null;
  assigned_agent_name?: string;
  follow_up_status?: string;
  follow_up_date?: string;
  remark?: string;
  created_at?: string;
  updated_at?: string;
}

type LeadFormData = Omit<Lead, 'id' | 'lead_code' | 'created_at' | 'updated_at'>;

export interface LeadQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  source?: string;
  departure_type?: string;
  assignedAgentId?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface LeadFollowupQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  assignedAgentId?: number;
  followupDate?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface LeadResponse {
  data: Lead[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface UpdateLeadStatusPayload {
  status: string;
  note?: string;
  followUpStatus?: 'pending' | 'follow_up_needed' | 'scheduled' | 'completed' | 'not_required';
  followUpDate?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class LeadService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLeads(query: LeadQueryParams = {}): Observable<LeadResponse> {
    let params = new HttpParams();

    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.source) params = params.set('source', query.source);
    if (query.departure_type) params = params.set('departure_type', query.departure_type);
    if (query.assignedAgentId) params = params.set('assignedAgentId', query.assignedAgentId);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.order) params = params.set('order', query.order);

    return this.http.get<LeadResponse>(`${this.apiUrl}/crm/leads`, { params });
  }

  getLeadsByAgent(
    agentId: number,
    query: Omit<LeadQueryParams, 'assignedAgentId'> = {},
  ): Observable<LeadResponse> {
    return this.getLeads({ ...query, assignedAgentId: agentId });
  }

  getLeadById(id: number) {
    return this.http.get(`${this.apiUrl}/crm/leads/${id}`);
  }

  getLeadActivites(id: number) {
    return this.http.get(`${this.apiUrl}/crm/leads/${id}/activities`);
  }

  createLead(payload: LeadFormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/crm/leads`, payload);
  }

  updateLead(id: number, payload: LeadFormData) {
    return this.http.patch(`${this.apiUrl}/crm/leads/${id}`, payload);
  }

  updateLeadStatus(id: number, payload: UpdateLeadStatusPayload) {
    return this.http.patch(`${this.apiUrl}/crm/leads/${id}/status`, payload);
  }

  adminUpdateLeadStatus(id: number, payload: UpdateLeadStatusPayload) {
    return this.http.patch(`${this.apiUrl}/crm/leads/${id}/admin-status`, payload);
  }

  assignLead(leadId: number, payload: {}) {
    return this.http.patch(`${this.apiUrl}/crm/leads/${leadId}/assign`, payload);
  }

  getLeadFollowups(query: LeadFollowupQueryParams = {}) {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    if (query.search) params = params.set('search', query.search);
    if (query.status) params = params.set('status', query.status);
    if (query.followupDate) params = params.set('follow_up_date', query.followupDate);
    if (query.assignedAgentId) params = params.set('assigned_agent_id', query.assignedAgentId);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.order) params = params.set('order', query.order);

    return this.http.get(`${this.apiUrl}/crm/leads/follow-ups`, { params });
  }

  updateLeadFollowupStatus(id: number, payload: {}) {
    return this.http.patch(`${this.apiUrl}/crm/leads/${id}/follow-up`, payload);
  }

  updateFollowup(
    id: number,
    payload: {
      followUpStatus: string;
      followUpDate?: string | null;
      note?: string | null;
    },
  ) {
    return this.http.patch(`${this.apiUrl}/crm/leads/${id}/follow-up`, {
      ...payload,
      note: payload.note ?? '',
    });
  }

  addFollowupNote(id: number, payload: {}) {
    return this.http.patch(`${this.apiUrl}/crm/leads/${id}/follow-up/add-note`, payload);
  }

  syncAll() {
    return this.http.post(`${this.apiUrl}/crm/leads/sync`, {});
  }

  getLeadsSummary() {
    return this.http.get<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/crm/dashboard/leads-summary`,
    );
  }

  getLeadsFollowupSummary() {
    return this.http.get<{ success: boolean; message: string; data: any }>(
      `${this.apiUrl}/crm/dashboard/leads-followups-summary`,
    );
  }
}
