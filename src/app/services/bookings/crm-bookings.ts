import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

import { CrmBookingDetailResponse, CrmBookingListResponse } from '../../models/crm-bookings.model';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class CrmBookingsService {
  private base = `${environment.apiUrl}/crm/bookings`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  private authOptions(params?: HttpParams) {
    let token = '';

    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token || ''}`,
      }),
      params,
    };
  }

  getBookings(query?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    payment_status?: string;
    date_from?: string;
    date_to?: string;
  }) {
    let params = new HttpParams();

    Object.entries(query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<CrmBookingListResponse>(this.base, this.authOptions(params));
  }

  getBookingById(id: number) {
    return this.http.get<CrmBookingDetailResponse>(`${this.base}/${id}`, this.authOptions());
  }

  updateStatus(id: number, payload: { status?: string; payment_status?: string }) {
    return this.http.patch(`${this.base}/${id}/status`, payload, this.authOptions());
  }

  updateNotes(id: number, ops_notes: string) {
    return this.http.patch(`${this.base}/${id}/notes`, { ops_notes }, this.authOptions());
  }

  updateFollowUp(
    id: number,
    payload: {
      follow_up_status?: string;
      follow_up_date?: string | null;
      follow_up_note?: string | null;
    },
  ) {
    return this.http.patch(`${this.base}/${id}/follow-up`, payload, this.authOptions());
  }

  getBookingTravellers(id: number) {
    return this.http.get<any>(`${this.base}/${id}/travellers`, this.authOptions());
  }

  addBookingTravellers(
    id: number,
    payload: {
      travellers: Array<{
        full_name: string;
        age?: number | null;
        passport_number?: string | null;
        email?: string | null;
        phone?: string | null;
      }>;
    },
  ) {
    return this.http.post(`${this.base}/${id}/travellers`, payload, this.authOptions());
  }

  verifyTravellerDocument(docId: number) {
    return this.http.patch(
      `${environment.apiUrl}/crm/documents/${docId}/verify`,
      {},
      this.authOptions(),
    );
  }

  rejectTravellerDocument(docId: number, rejection_reason: string) {
    return this.http.patch(
      `${environment.apiUrl}/crm/documents/${docId}/reject`,
      { rejection_reason },
      this.authOptions(),
    );
  }

  getTourDepartures() {
    return this.http.get(
      `${environment.apiUrl}/crm/tours/departures?status=upcoming&seats=available`,
      this.authOptions(),
    );
  }
  createBooking(payload: any) {
    return this.http.post(`${environment.apiUrl}/crm/bookings`, payload);
  }
}
