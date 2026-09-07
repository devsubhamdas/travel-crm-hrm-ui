import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LucideAngularModule, HouseIcon } from 'lucide-angular';
import { PageToolbar } from '../../../../components/common/page-toolbar/page-toolbar';

@Component({
  selector: 'app-booking',
  imports: [ButtonModule, LucideAngularModule, PageToolbar],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking {
  showNewBookingForm = false;
  syncLoading = signal(false);

  onSearch(event: any) {}

  handleSync() {}
}
