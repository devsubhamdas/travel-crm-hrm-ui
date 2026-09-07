import { Component, OnInit, signal } from '@angular/core';
import { LeadService } from '../../../../services/lead/lead-service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimelineModule } from 'primeng/timeline';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-lead-details-and-activity',
  imports: [TimelineModule, CommonModule, CardModule, TagModule, DividerModule, SkeletonModule],
  templateUrl: './lead-details-and-activity.html',
  styleUrl: './lead-details-and-activity.scss',
})
export class LeadDetailsAndActivity implements OnInit {
  leadId!: number;
  lead = signal<any>(null);
  timeline = signal<any[]>([]);
  leadLoading = signal(true);
  timelineLoading = signal(true);

  statusSeverityMap: Record<string, any> = {
    new: 'info',
    contacted: 'info',
    qualified: 'success',
    quoted: 'warn',
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

  sourceSeverityMap: Record<string, any> = {
    manual: 'secondary',
    walk_in: 'success',
    referral: 'info',
    whatsapp: 'info',
    call: 'warn',
    email: 'warn',
    media_ad: 'warn',
    social_ad: 'danger',
    twak_to: 'info',
    datasheet: 'secondary',
  };

  departureTypeSeverityMap: Record<string, any> = {
    group: 'success',
    fixed: 'info',
    others: 'secondary',
  };

  constructor(
    private leadService: LeadService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.leadId = Number(this.route.snapshot.paramMap.get('id'));
    this.getLeadById();
    this.getLeadActivities();
  }

  getLeadById() {
    this.leadLoading.set(true);
    this.leadService.getLeadById(this.leadId).subscribe({
      next: (data: any) => {
        console.log(data);
        this.lead.set(data.data);
        this.leadLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.leadLoading.set(false);
      },
    });
  }

  getLeadActivities() {
    this.timelineLoading.set(true);
    this.leadService.getLeadActivites(this.leadId).subscribe({
      next: (data: any) => {
        this.timeline.set(data.timeline);
        this.timelineLoading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.timelineLoading.set(false);
      },
    });
  }

  getStatusSeverity(status: string | undefined) {
    return this.statusSeverityMap[status ?? ''] ?? 'info';
  }

  getFollowUpSeverity(status: string) {
    return this.followUpSeverityMap[status] ?? 'secondary';
  }

  getSourceSeverity(source: string) {
    return this.sourceSeverityMap[source] ?? 'secondary';
  }

  getDepartureSeverity(type: string) {
    return this.departureTypeSeverityMap[type] ?? 'secondary';
  }
}
