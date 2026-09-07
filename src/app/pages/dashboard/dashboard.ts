import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { PageToolbar } from '../../components/common/page-toolbar/page-toolbar';
import { DataTable } from '../../components/common/data-table/data-table';
import { LeadService } from '../../services/lead/lead-service';
import { forkJoin } from 'rxjs';

interface DashboardSummary {
  totalLeads: number | string;
  newLeads: number | string;
  todayFollowups: number | string;
  overdueFollowups: number | string;
  quotedLeads: number | string;
  convertedLeads: number | string;
  lostLeads: number | string;
  conversionRate: number | string;
}

interface FollowupItem {
  id: number;
  leadCode: string;
  name: string;
  destination: string;
  assignedAgent: string;
  followUpDate: string;
  status: string;
  note?: string;
}

interface RecentLead {
  id: number;
  lead_code: string;
  name: string;
  email: string;
  contact_no: string;
  destination: string;
  budget: string;
  source: string;
  status: string;
  follow_up_status: string;
  follow_up_date: string;
  assigned_agent_name: string;
  updated_at: string;
}

@Component({
  selector: 'app-leads-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    InputTextModule,
    ChartModule,
    TagModule,
    // PageToolbar,
    DataTable,
    // DecimalPipe,
    // TitleCasePipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  providers: [DatePipe],
})
export class Dashboard implements OnInit {
  filterForm: FormGroup;

  summary = signal<DashboardSummary>({
    totalLeads: '-',
    newLeads: '-',
    todayFollowups: '-',
    overdueFollowups: '-',
    quotedLeads: '-',
    convertedLeads: '-',
    lostLeads: '-',
    conversionRate: '-',
  });

  statusChartData: any;
  sourceChartData: any;
  chartOptions: any;

  todayFollowups = signal<FollowupItem[]>([
    // {
    //   id: 1,
    //   leadCode: 'LD-1021',
    //   name: 'Aamir Khan',
    //   destination: 'Bali',
    //   assignedAgent: 'Saqib',
    //   followUpDate: '2026-03-30T10:30:00',
    //   status: 'scheduled',
    //   note: 'Asked for 4-star quote',
    // },
    // {
    //   id: 2,
    //   leadCode: 'LD-1022',
    //   name: 'Fatima Noor',
    //   destination: 'Thailand',
    //   assignedAgent: 'Ali',
    //   followUpDate: '2026-03-30T14:00:00',
    //   status: 'follow_up_needed',
    //   note: 'Requested revised package',
    // },
  ]);

  overdueFollowups = signal<FollowupItem[]>([
    // {
    //   id: 11,
    //   leadCode: 'LD-1002',
    //   name: 'Usman Tariq',
    //   destination: 'Dubai',
    //   assignedAgent: 'Saqib',
    //   followUpDate: '2026-03-28T11:00:00',
    //   status: 'scheduled',
    //   note: 'Customer was waiting for visa clarification',
    // },
    // {
    //   id: 12,
    //   leadCode: 'LD-1005',
    //   name: 'Maria Joseph',
    //   destination: 'Maldives',
    //   assignedAgent: 'Ali',
    //   followUpDate: '2026-03-27T17:30:00',
    //   status: 'scheduled',
    //   note: 'No response after quotation',
    // },
  ]);

  recentLeadsColumns = [
    { field: 'lead_code', header: 'Lead Code' },
    { field: 'name', header: 'Name' },
    { field: 'contact_no', header: 'Contact' },
    { field: 'destination', header: 'Destination' },
    { field: 'budget', header: 'Budget' },
    { field: 'source', header: 'Source' },
    { field: 'status', header: 'Status' },
    { field: 'follow_up_status', header: 'Follow-up' },
    { field: 'follow_up_date', header: 'Follow-up Date' },
    { field: 'assigned_agent_name', header: 'Agent' },
    { field: 'updated_at', header: 'Updated At' },
  ];

  recentLeads = signal<RecentLead[]>([
    // {
    //   id: 1,
    //   lead_code: 'LD-1021',
    //   name: 'Aamir Khan',
    //   email: 'aamir@example.com',
    //   contact_no: '+91 9999999911',
    //   destination: 'Bali',
    //   budget: '₹1,20,000',
    //   source: 'Website',
    //   status: 'quoted',
    //   follow_up_status: 'scheduled',
    //   follow_up_date: '30 Mar 2026',
    //   assigned_agent_name: 'Saqib',
    //   updated_at: '30 Mar 2026, 10:12 AM',
    // },
    // {
    //   id: 2,
    //   lead_code: 'LD-1022',
    //   name: 'Fatima Noor',
    //   email: 'fatima@example.com',
    //   contact_no: '+91 9999999922',
    //   destination: 'Thailand',
    //   budget: '₹95,000',
    //   source: 'Manual',
    //   status: 'qualified',
    //   follow_up_status: 'follow_up_needed',
    //   follow_up_date: '30 Mar 2026',
    //   assigned_agent_name: 'Ali',
    //   updated_at: '30 Mar 2026, 09:10 AM',
    // },
    // {
    //   id: 3,
    //   lead_code: 'LD-1002',
    //   name: 'Usman Tariq',
    //   email: 'usman@example.com',
    //   contact_no: '+91 9999999933',
    //   destination: 'Dubai',
    //   budget: '₹80,000',
    //   source: 'Referral',
    //   status: 'contacted',
    //   follow_up_status: 'scheduled',
    //   follow_up_date: '28 Mar 2026',
    //   assigned_agent_name: 'Saqib',
    //   updated_at: '29 Mar 2026, 06:40 PM',
    // },
    // {
    //   id: 4,
    //   lead_code: 'LD-0991',
    //   name: 'Nazia Sheikh',
    //   email: 'nazia@example.com',
    //   contact_no: '+91 9999999944',
    //   destination: 'Singapore',
    //   budget: '₹1,45,000',
    //   source: 'Instagram',
    //   status: 'converted',
    //   follow_up_status: 'not_required',
    //   follow_up_date: '-',
    //   assigned_agent_name: 'Ahmed',
    //   updated_at: '29 Mar 2026, 03:25 PM',
    // },
  ]);

  sourceOptions = [
    { label: 'All Sources', value: '' },
    { label: 'Website', value: 'Website' },
    { label: 'Manual', value: 'Manual' },
    { label: 'Referral', value: 'Referral' },
    { label: 'Social Media', value: 'Social Media' },
    { label: 'Walk-in', value: 'Walk-in' },
  ];

  statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'New', value: 'new' },
    { label: 'Contacted', value: 'contacted' },
    { label: 'Qualified', value: 'qualified' },
    { label: 'Quoted', value: 'quoted' },
    { label: 'Negotiation', value: 'negotiation' },
    { label: 'Booking In Progress', value: 'booking_in_progress' },
    { label: 'Converted', value: 'converted' },
    { label: 'Lost', value: 'lost' },
  ];

  agentOptions = [
    { label: 'All Agents', value: '' },
    { label: 'Saqib', value: 'Saqib' },
    { label: 'Ali', value: 'Ali' },
    { label: 'Ahmed', value: 'Ahmed' },
  ];

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private leadService: LeadService,
  ) {
    this.filterForm = this.fb.group({
      dateRange: [null],
      assignedAgent: [''],
      source: [''],
      status: [''],
      search: [''],
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
    // this.initCharts();
  }

  initCharts(statusChartData: any, sourceChartData: any) {
    // this.statusChartData = {
    //   labels: ['New', 'Contacted', 'Qualified', 'Quoted', 'Negotiation', 'Converted', 'Lost'],
    //   datasets: [
    //     {
    //       label: 'Lead Status',
    //       data: [24, 52, 40, 41, 19, 12, 9],
    //     },
    //   ],
    // };

    // this.sourceChartData = {
    //   labels: ['Website', 'Manual', 'Referral', 'Social Media', 'Walk-in'],
    //   datasets: [
    //     {
    //       data: [120, 68, 44, 59, 35],
    //     },
    //   ],
    // };
    this.statusChartData = statusChartData;
    this.sourceChartData = sourceChartData;

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
          },
        },
      },
    };
  }

  applyFilters() {
    const values = this.filterForm.getRawValue();
    console.log('Apply filters', values);
    // backend integration later
  }

  clearFilters() {
    this.filterForm.reset({
      dateRange: null,
      assignedAgent: '',
      source: '',
      status: '',
      search: '',
    });
  }

  // loadLeadsSummary() {
  //   this.leadService.getLeadsSummary().subscribe({
  //     next: (data: any) => {
  //       console.log(data);
  //       this.summary.update((prev) => ({
  //         ...prev,
  //         totalLeads: data.data.total,
  //         newLeads: data.data.count_by_status.new,
  //         todayFollowups: data.data.todays_followups_count,
  //         quotedLeads: data.data.count_by_status.quoted,
  //         convertedLeads: data.data.count_by_status.converted,
  //         lostLeads: data.data.count_by_status.lost,
  //         conversionRate: data.data.conversion_rate,
  //       }));
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     },
  //   });
  // }

  // loadLeadsFollowupSummary() {
  //   this.leadService.getLeadsFollowupSummary().subscribe({
  //     next: (data: any) => {
  //       console.log(data);
  //       this.summary.update((prev) => ({
  //         ...prev,
  //         overdueFollowups: data.data.count_by_status.missed,
  //       }));
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     },
  //   });
  // }

  loadDashboardData() {
    forkJoin({
      leadsSummary: this.leadService.getLeadsSummary(),
      followupsSummary: this.leadService.getLeadsFollowupSummary(),
    }).subscribe({
      next: ({ leadsSummary, followupsSummary }) => {
        // top summary
        this.summary.set({
          totalLeads: leadsSummary.data.total,
          newLeads: leadsSummary.data.count_by_status.new,
          todayFollowups: leadsSummary.data.todays_followups_count,
          overdueFollowups: followupsSummary.data.count_by_status.missed,
          quotedLeads: leadsSummary.data.count_by_status.quoted,
          convertedLeads: leadsSummary.data.count_by_status.converted,
          lostLeads: leadsSummary.data.count_by_status.lost,
          conversionRate: leadsSummary.data.conversion_rate,
        });

        // bar and chart
        const statusChartData = {
          labels: Object.keys(leadsSummary.data.count_by_status),
          datasets: [
            {
              label: 'Lead Status',
              data: Object.values(leadsSummary.data.count_by_status),
            },
          ],
        };

        const sourceChartData = {
          labels: Object.keys(leadsSummary.data.count_by_source_type),
          datasets: [
            {
              data: Object.values(leadsSummary.data.count_by_source_type),
            },
          ],
        };

        this.initCharts(statusChartData, sourceChartData);

        // leads and followups info
        const todayFollowups = leadsSummary.data.todays_followups.map((item: any) => ({
          id: item.id,
          leadCode: item.lead_code,
          name: item.name,
          destination: item.destination ?? '-',
          assignedAgent: item.assigned_agent_name ?? '-',
          followUpDate: item.follow_up_date ?? '-',
          status: item.status,
          note: item.remark ?? '-',
        }));

        this.todayFollowups.set(todayFollowups);

        const overdueLeads = leadsSummary.data.overdue_leads.map((item: any) => ({
          id: item.id,
          leadCode: item.lead_code,
          name: item.name,
          destination: item.destination ?? '-',
          assignedAgent: item.assigned_agent_name ?? '-',
          followUpDate: item.follow_up_date,
          status: item.status,
          note: item.remark ?? '-',
        }));
        this.overdueFollowups.set(overdueLeads);

        //   id: 1,
        //   lead_code: 'LD-1021',
        //   name: 'Aamir Khan',
        //   email: 'aamir@example.com',
        //   contact_no: '+91 9999999911',
        //   destination: 'Bali',
        //   budget: '₹1,20,000',
        //   source: 'Website',
        //   status: 'quoted',
        //   follow_up_status: 'scheduled',
        //   follow_up_date: '30 Mar 2026',
        //   assigned_agent_name: 'Saqib',
        //   updated_at: '30 Mar 2026, 10:12 AM',

        const recentLeads = leadsSummary.data.recent_leads.map((item: any) => ({
          id: item.id,
          lead_code: item.lead_code,
          name: item.name,
          email: item.email ?? '-',
          contact_no: item.contact_no ?? '-',
          destination: item.destination ?? '-',
          budget: item.budget ?? '-',
          source: item.source_type,
          status: item.status,
          follow_up_status: item.follow_up_status,
          follow_up_date: item.follow_up_date ?? '-',
          assigned_agent_name: item.assigned_agent_name ?? '-',
          updated_at: item.updated_at,
        }));
        this.recentLeads.set(recentLeads);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onLazyLoad(event: { page: number; pageSize: number }) {
    console.log('load leads page', event);
  }

  getStatusSeverity(
    status: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch ((status || '').toLowerCase()) {
      case 'new':
        return 'info';
      case 'contacted':
        return 'contrast';
      case 'qualified':
        return 'secondary';
      case 'quoted':
        return 'warn';
      case 'negotiation':
        return 'warn';
      case 'booking_in_progress':
        return 'contrast';
      case 'converted':
        return 'success';
      case 'lost':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getFollowupSeverity(
    status: string,
  ): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch ((status || '').toLowerCase()) {
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'follow_up_needed':
        return 'warn';
      case 'not_required':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  formatDateTime(date: string): string {
    return this.datePipe.transform(date, 'dd MMM yyyy, hh:mm a') || '-';
  }

  viewLead(item: FollowupItem | RecentLead) {
    console.log('view lead', item);
  }

  updateFollowup(item: FollowupItem) {
    console.log('update followup', item);
  }

  createQuotation(item: FollowupItem | RecentLead) {
    console.log('create quotation', item);
  }

  addLead() {
    console.log('open add lead');
  }

  exportLeads() {
    console.log('export leads');
  }
}
