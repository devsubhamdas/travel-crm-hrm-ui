import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  BookingFollowUpStatus,
  BookingStatus,
  CrmBookingDetailResponse,
  CrmBookingListItem,
  CrmBookingTravellerItem,
  PaymentStatus,
} from '../../../models/crm-bookings.model';
import { CrmBookingsService } from '../../../services/bookings/crm-bookings';
import { ButtonModule } from 'primeng/button';
import { FormDialog } from '../../../components/common/form-dialog/form-dialog';
import { DatePipe } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';

type DrawerTab = 'overview' | 'travellers' | 'documents';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    FormDialog,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    InputTextModule,
  ],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
  providers: [DatePipe],
})
export class Bookings implements OnInit, OnDestroy {
  isLoading = false;
  error: string | null = null;

  bookings: CrmBookingListItem[] = [];
  total = 0;
  page = 1;
  limit = 10;

  search = '';
  status = '';
  paymentStatus = '';

  selectedBookingId: number | null = null;
  selectedBooking: CrmBookingDetailResponse | null = null;
  isLoadingDetails = false;
  detailsError: string | null = null;
  showDrawer = false;

  activeDrawerTab: DrawerTab = 'overview';

  isSavingStatus = false;
  isSavingNotes = false;
  isSavingFollowUp = false;

  editStatus: BookingStatus | '' = '';
  editPaymentStatus: PaymentStatus | '' = '';
  editOpsNotes = '';
  editFollowUpStatus: BookingFollowUpStatus | '' = '';
  editFollowUpDate = '';
  editFollowUpNote = '';

  travellers: CrmBookingTravellerItem[] = [];
  isLoadingTravellers = false;
  travellersError: string | null = null;

  isSavingTravellers = false;
  addTravellerError: string | null = null;

  selectedTravellerId: number | null = null;

  isUpdatingDocument = false;
  documentActionError: string | null = null;

  rejectingDocumentId: number | null = null;
  rejectReason = '';

  newTravellers: Array<{
    full_name: string;
    age: number | null;
    passport_number: string;
    email: string;
    phone: string;
  }> = [this.createEmptyTraveller()];

  readonly bookingStatuses: BookingStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  readonly paymentStatuses: PaymentStatus[] = ['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED'];
  readonly followUpStatuses: BookingFollowUpStatus[] = [
    'pending',
    'follow_up_needed',
    'scheduled',
    'completed',
    'not_required',
  ];

  departures = signal<any[]>([]);
  departureOptions = signal<{ label: string; value: number }[]>([]);
  showNewBookingForm: boolean = false;
  newBookingForm: FormGroup;
  today: Date = new Date();
  selectedDepartureSeats = signal<number | null>(null);
  selectedDepartureTourId = signal<number | null>(null);

  paymentStatusOptions = [
    { label: 'Unpaid', value: 'UNPAID' },
    { label: 'Partial', value: 'PARTIAL' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Refunded', value: 'REFUNDED' },
  ];

  bookingStatusOptions = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  followUpStatusOptions = [
    { label: 'Pending', value: 'pending' },
    { label: 'Follow-up Needed', value: 'follow_up_needed' },
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Completed', value: 'completed' },
    { label: 'Not Required', value: 'not_required' },
  ];

  constructor(
    private bookingsService: CrmBookingsService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
  ) {
    this.newBookingForm = this.fb.group({
      user_id: [null],
      customer_name: [
        '',
        [Validators.required, Validators.maxLength(120), Validators.pattern(/^[a-zA-Z\s.]+$/)],
      ],
      customer_email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      customer_phone: [
        '',
        [
          Validators.required,
          Validators.maxLength(20),
          Validators.pattern(/^(\+91[-]?)?[6-9]\d{9}$/),
        ],
      ],
      guests: [null, [Validators.required, Validators.min(1)]],
      travel_date: [null, Validators.required],
      departure_id: [null, [Validators.required, Validators.min(1)]],
      total_amount_paise: [null, [Validators.required, Validators.min(0)]],
      ops_notes: [''],
      follow_up_status: ['pending'],
      follow_up_date: [null],
      follow_up_note: [''],
      payment_status: ['UNPAID'],
      status: ['PENDING'],
    });
  }

  ngOnInit(): void {
    this.loadBookings();
    this.loadTourDepartures();
  }

  ngOnDestroy(): void {
    this.unlockBody();
  }

  createEmptyTraveller() {
    return {
      full_name: '',
      age: null,
      passport_number: '',
      email: '',
      phone: '',
    };
  }

  loadBookings() {
    this.isLoading = true;
    this.error = null;

    this.bookingsService
      .getBookings({
        page: this.page,
        limit: this.limit,
        search: this.search,
        status: this.status,
        payment_status: this.paymentStatus,
      })
      .subscribe({
        next: (res) => {
          this.bookings = res.items || [];
          this.total = res.pagination?.total || 0;
          this.page = res.pagination?.page || 1;
          this.limit = res.pagination?.limit || 10;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load bookings';
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  applyFilters() {
    this.page = 1;
    this.loadBookings();
  }

  resetFilters() {
    this.search = '';
    this.status = '';
    this.paymentStatus = '';
    this.page = 1;
    this.loadBookings();
  }

  prevPage() {
    if (this.page <= 1) return;
    this.page--;
    this.loadBookings();
  }

  nextPage() {
    if (this.page >= this.totalPages()) return;
    this.page++;
    this.loadBookings();
  }

  openDetails(id: number) {
    this.selectedBookingId = id;
    this.showDrawer = true;
    this.activeDrawerTab = 'overview';
    this.lockBody();
    this.resetDrawerSecondaryState();
    this.fetchBookingDetails(id);
  }

  fetchBookingDetails(id: number) {
    this.isLoadingDetails = true;
    this.detailsError = null;
    this.selectedBooking = null;

    this.bookingsService.getBookingById(id).subscribe({
      next: (res) => {
        this.selectedBooking = res;
        this.editStatus = (res.booking.status || '') as BookingStatus | '';
        this.editPaymentStatus = (res.booking.payment_status || '') as PaymentStatus | '';
        this.editOpsNotes = res.booking.ops_notes || '';
        this.editFollowUpStatus = (res.booking.follow_up_status || '') as
          | BookingFollowUpStatus
          | '';
        this.editFollowUpDate = res.booking.follow_up_date
          ? this.toDateInputValue(res.booking.follow_up_date)
          : '';
        this.editFollowUpNote = res.booking.follow_up_note || '';
        this.isLoadingDetails = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.detailsError = err?.error?.message || 'Failed to load booking details';
        this.isLoadingDetails = false;
        this.cdr.markForCheck();
      },
    });
  }

  closeDrawer() {
    this.showDrawer = false;
    this.selectedBookingId = null;
    this.selectedBooking = null;
    this.detailsError = null;
    this.activeDrawerTab = 'overview';
    this.resetDrawerSecondaryState();
    this.unlockBody();
  }

  resetDrawerSecondaryState() {
    this.travellers = [];
    this.isLoadingTravellers = false;
    this.travellersError = null;
    this.isSavingTravellers = false;
    this.addTravellerError = null;
    this.selectedTravellerId = null;
    this.newTravellers = [this.createEmptyTraveller()];
    this.isUpdatingDocument = false;
    this.documentActionError = null;
    this.rejectingDocumentId = null;
    this.rejectReason = '';
  }

  setDrawerTab(tab: DrawerTab) {
    this.activeDrawerTab = tab;

    if (
      (tab === 'travellers' || tab === 'documents') &&
      this.selectedBookingId &&
      !this.isLoadingTravellers
    ) {
      this.loadTravellers();
    }
  }

  loadTravellers() {
    if (!this.selectedBookingId) return;

    this.isLoadingTravellers = true;
    this.travellersError = null;

    this.bookingsService.getBookingTravellers(this.selectedBookingId).subscribe({
      next: (res: any) => {
        this.travellers = res?.items || [];
        this.isLoadingTravellers = false;

        if (!this.selectedTravellerId && this.travellers.length > 0) {
          this.selectedTravellerId = this.travellers[0].id;
        } else if (
          this.selectedTravellerId &&
          !this.travellers.some((t) => t.id === this.selectedTravellerId)
        ) {
          this.selectedTravellerId = this.travellers.length ? this.travellers[0].id : null;
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.travellersError = err?.error?.message || 'Failed to load travellers';
        this.isLoadingTravellers = false;
        this.cdr.markForCheck();
      },
    });
  }

  addTravellerRow() {
    this.newTravellers.push(this.createEmptyTraveller());
  }

  removeTravellerRow(index: number) {
    if (this.newTravellers.length === 1) return;
    this.newTravellers.splice(index, 1);
  }

  saveTravellers() {
    if (!this.selectedBookingId) return;

    const travellers = this.newTravellers
      .map((t) => ({
        full_name: t.full_name.trim(),
        age: t.age,
        passport_number: t.passport_number.trim() || null,
        email: t.email.trim() || null,
        phone: t.phone.trim() || null,
      }))
      .filter((t) => !!t.full_name);

    if (!travellers.length) {
      this.addTravellerError = 'Please enter at least one traveller name.';
      return;
    }

    this.addTravellerError = null;
    this.isSavingTravellers = true;

    this.bookingsService.addBookingTravellers(this.selectedBookingId, { travellers }).subscribe({
      next: () => {
        this.isSavingTravellers = false;
        this.newTravellers = [this.createEmptyTraveller()];
        this.loadTravellers();
      },
      error: (err) => {
        this.isSavingTravellers = false;
        this.addTravellerError = err?.error?.message || 'Failed to add travellers';
      },
    });
  }

  selectTraveller(travellerId: number) {
    this.selectedTravellerId = travellerId;
    this.activeDrawerTab = 'documents';
  }

  get selectedTraveller(): CrmBookingTravellerItem | null {
    return this.travellers.find((t) => t.id === this.selectedTravellerId) || null;
  }

  get requiredDocuments() {
    const traveller = this.selectedTraveller;
    if (!traveller) return [];

    const docs = traveller.documents || [];

    const getDoc = (type: string) =>
      docs.find((d) => d.doc_type === type) || {
        id: 0,
        booking_id: traveller.booking_id,
        traveller_id: traveller.id,
        doc_type: type,
        doc_label: null,
        status: 'not_uploaded',
        file_url: null,
        file_name: null,
        rejection_reason: null,
        uploaded_at: null,
        updated_at: null,
      };

    return [getDoc('passport'), getDoc('visa'), getDoc('id_proof')];
  }

  get supportingDocuments() {
    const traveller = this.selectedTraveller;
    if (!traveller) return [];
    return (traveller.documents || []).filter((d) => d.doc_type === 'supporting');
  }

  saveStatus() {
    if (!this.selectedBookingId) return;

    this.isSavingStatus = true;

    this.bookingsService
      .updateStatus(this.selectedBookingId, {
        status: this.editStatus || undefined,
        payment_status: this.editPaymentStatus || undefined,
      })
      .subscribe({
        next: () => {
          this.isSavingStatus = false;
          this.loadBookings();
          this.fetchBookingDetails(this.selectedBookingId!);
        },
        error: () => {
          this.isSavingStatus = false;
        },
      });
  }

  saveNotes() {
    if (!this.selectedBookingId) return;

    this.isSavingNotes = true;

    this.bookingsService.updateNotes(this.selectedBookingId, this.editOpsNotes).subscribe({
      next: () => {
        this.isSavingNotes = false;
        this.fetchBookingDetails(this.selectedBookingId!);
      },
      error: () => {
        this.isSavingNotes = false;
      },
    });
  }

  saveFollowUp() {
    if (!this.selectedBookingId) return;

    this.isSavingFollowUp = true;

    this.bookingsService
      .updateFollowUp(this.selectedBookingId, {
        follow_up_status: this.editFollowUpStatus || undefined,
        follow_up_date: this.editFollowUpDate || null,
        follow_up_note: this.editFollowUpNote || null,
      })
      .subscribe({
        next: () => {
          this.isSavingFollowUp = false;
          this.loadBookings();
          this.fetchBookingDetails(this.selectedBookingId!);
        },
        error: () => {
          this.isSavingFollowUp = false;
        },
      });
  }

  amountInInr(paise: number | null | undefined): number {
    return Number(paise || 0) / 100;
  }

  totalPages(): number {
    return Math.max(Math.ceil(this.total / this.limit), 1);
  }

  trackByBookingId = (_: number, item: CrmBookingListItem) => item.id;
  trackByTravellerId = (_: number, item: CrmBookingTravellerItem) => item.id;

  statusClass(status?: string | null): string {
    switch ((status || '').toUpperCase()) {
      case 'CONFIRMED':
      case 'PAID':
      case 'VERIFIED':
        return 'success';
      case 'PENDING':
      case 'PARTIAL':
        return 'info';
      case 'CANCELLED':
      case 'REFUNDED':
      case 'REJECTED':
        return 'danger';
      default:
        return 'muted';
    }
  }

  parseChildAges(value?: string | null): string {
    if (!value) return '';
    try {
      const arr = JSON.parse(value);
      return Array.isArray(arr) ? arr.join(', ') : '';
    } catch {
      return value;
    }
  }

  private toDateInputValue(date: string) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private lockBody() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.body.style.overflow = 'hidden';
  }

  private unlockBody() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.body.style.overflow = '';
  }

  verifyDocument(docId: number) {
    if (!docId || this.isUpdatingDocument || !this.selectedBookingId) return;

    this.isUpdatingDocument = true;
    this.documentActionError = null;

    this.bookingsService.verifyTravellerDocument(docId).subscribe({
      next: () => {
        this.isUpdatingDocument = false;
        this.loadTravellers();
      },
      error: (err) => {
        this.isUpdatingDocument = false;
        this.documentActionError = err?.error?.message || 'Failed to verify document';
      },
    });
  }

  openRejectDocument(docId: number) {
    this.rejectingDocumentId = docId;
    this.rejectReason = '';
    this.documentActionError = null;
  }

  closeRejectDocument() {
    if (this.isUpdatingDocument) return;
    this.rejectingDocumentId = null;
    this.rejectReason = '';
  }

  submitRejectDocument() {
    if (!this.rejectingDocumentId || this.isUpdatingDocument || !this.selectedBookingId) return;

    const reason = this.rejectReason.trim();
    if (!reason) {
      this.documentActionError = 'Please enter rejection reason';
      return;
    }

    this.isUpdatingDocument = true;
    this.documentActionError = null;

    this.bookingsService.rejectTravellerDocument(this.rejectingDocumentId, reason).subscribe({
      next: () => {
        this.isUpdatingDocument = false;
        this.rejectingDocumentId = null;
        this.rejectReason = '';
        this.loadTravellers();
      },
      error: (err) => {
        this.isUpdatingDocument = false;
        this.documentActionError = err?.error?.message || 'Failed to reject document';
      },
    });
  }

  canVerifyDocument(status?: string | null) {
    return ['pending', 'rejected'].includes((status || '').toLowerCase());
  }

  canRejectDocument(status?: string | null) {
    return ['pending'].includes((status || '').toLowerCase());
  }

  handleNewBooking() {
    if (this.newBookingForm.invalid) {
      this.newBookingForm.markAllAsTouched();
      return;
    }

    const payload = {
      ...this.newBookingForm.value,
      tour_id: this.selectedDepartureTourId(),
      travel_date: this.newBookingForm.value.travel_date
        ? this.toLocalDate(this.newBookingForm.value.travel_date as Date)
        : undefined,
      follow_up_date: this.newBookingForm.value.follow_up_date
        ? this.toLocalDate(this.newBookingForm.value.follow_up_date as Date)
        : undefined,
    };

    console.log(payload);

    this.bookingsService.createBooking(payload).subscribe({
      next: (data: any) => {
        this.showNewBookingForm = false;
        this.newBookingForm.reset({
          payment_status: 'UNPAID',
          status: 'PENDING',
          follow_up_status: 'pending',
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: data?.message ?? 'Booking created successfully',
        });
        this.loadBookings();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message ?? err.message ?? 'Something went wrong',
        });
      },
    });
  }

  loadTourDepartures() {
    this.bookingsService.getTourDepartures().subscribe({
      next: (data: any) => {
        const options = data?.data?.map((departure: any) => ({
          label: `${this.datePipe.transform(departure.departure_date, 'dd MMM yyyy')} - ${departure.tour.title}`,
          value: departure.id,
        }));
        this.departureOptions.set(options);
        this.departures.set(data?.data);
      },
      error: (err) => console.log(err),
    });
  }

  onDepartureSelect(event: { value: number }) {
    const departure = this.departures().find((d) => d.id === event.value);
    const seats = departure?.available_seats ?? null;
    this.selectedDepartureSeats.set(seats);
    const tourId = departure?.tour_id ?? null;
    this.selectedDepartureTourId.set(tourId);

    // update guests max validator dynamically
    const guestsControl = this.newBookingForm.get('guests');
    if (seats !== null) {
      guestsControl?.setValidators([Validators.required, Validators.min(1), Validators.max(seats)]);
    } else {
      guestsControl?.setValidators([Validators.required, Validators.min(1)]);
    }
    guestsControl?.updateValueAndValidity();
  }

  toLocalDate(raw: Date) {
    const d = new Date(raw);
    // Build a date string in local time, no UTC shift
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}` || null; // "2026-04-03"
  }
}
