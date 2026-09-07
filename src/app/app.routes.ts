import { Routes } from '@angular/router';
import { roleGuard } from './guards/role/role-guard';
import { authGuard } from './guards/auth/auth-guard';
import { guestGuard } from './guards/guest/guest-guard';
import { homeRedirectGuard } from './guards/home-redirect/home-redirect-guard';

export const routes: Routes = [
  // PUBLIC ROUTES
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./pages/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },

  // PROTECTED APP SHELL
  {
    path: '',
    loadComponent: () =>
      import('./components/layouts/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        canActivate: [homeRedirectGuard],
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
        data: {
          title: 'Dashboard',
          summary: 'Visualize company performance and growth.',
        },
      },
      {
        path: 'operations',
        canActivate: [roleGuard],
        loadComponent: () => import('./pages/operation/operation').then((m) => m.Operation),
        data: {
          roles: ['admin', 'operator'],
          title: 'Operations',
          summary: 'Manage company operations such as booking, ticketing etc.',
        },
        children: [
          { path: '', redirectTo: 'manage-bookings', pathMatch: 'full' },
          {
            path: 'manage-bookings',
            loadComponent: () =>
              import('./pages/operation/bookings/bookings').then((m) => m.Bookings),
          },
          {
            path: 'manage-ticket-issues',
            loadComponent: () =>
              import('./pages/operation/pages/ticket-issue/ticket-issue').then(
                (m) => m.TicketIssue,
              ),
          },
          {
            path: 'manage-booking-follow-ups',
            loadComponent: () =>
              import('./pages/operation/pages/booking-follow-ups/booking-follow-ups').then(
                (m) => m.BookingFollowUps,
              ),
          },
          {
            path: 'manage-customer-documents',
            loadComponent: () =>
              import('./pages/operation/pages/customer-documents/customer-documents').then(
                (m) => m.CustomerDocuments,
              ),
          },
        ],
      },
      {
        path: 'leads',
        canActivate: [roleGuard],
        loadComponent: () => import('./pages/leads/leads').then((m) => m.Leads),
        data: {
          roles: ['admin', 'sales', 'operator'],
          title: 'Leads',
          summary: 'Manage customers, leads, follow-ups etc.',
        },
        children: [
          { path: '', redirectTo: 'manage-leads', pathMatch: 'full' },
          {
            path: 'manage-leads',
            loadComponent: () => import('./pages/leads/pages/leads/leads').then((m) => m.Leads),
          },
          {
            path: 'manage-follow-ups',
            canActivate: [roleGuard],
            loadComponent: () =>
              import('./pages/leads/pages/follow-ups/follow-ups').then((m) => m.FollowUps),
            data: {
              roles: ['admin', 'sales', 'manager'],
            },
          },
          {
            path: 'manage-customers',
            loadComponent: () =>
              import('./pages/leads/pages/customer/customer').then((m) => m.Customer),
          },
          {
            path: 'manage-enquiries',
            loadComponent: () =>
              import('./pages/leads/pages/enquiry/enquiry').then((m) => m.Enquiry),
          },
          {
            path: 'manage-communication-logs',
            loadComponent: () =>
              import('./pages/leads/pages/communication-log/communication-log').then(
                (m) => m.CommunicationLog,
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/leads/pages/lead-details-and-activity/lead-details-and-activity').then(
                (m) => m.LeadDetailsAndActivity,
              ),
          },
        ],
      },
      {
        path: 'employees',
        canActivate: [roleGuard],
        loadComponent: () => import('./pages/employees/employees').then((m) => m.Employees),
        data: {
          roles: ['admin', 'manager'],
          title: 'Employees',
          summary: 'Manage employees, assign task, analyze reports etc.',
        },
        children: [
          { path: '', redirectTo: 'manage-employees', pathMatch: 'full' },
          {
            path: 'manage-employees',
            loadComponent: () =>
              import('./pages/employees/pages/employees/employees').then((m) => m.Employees),
          },
          {
            path: 'manage-tasks',
            loadComponent: () => import('./pages/employees/pages/task/task').then((m) => m.Task),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/employees/pages/employee-details/employee-details').then(
                (m) => m.EmployeeDetails,
              ),
          },
        ],
      },
      {
        path: 'tours',
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./pages/tour-management/tour-management').then((m) => m.TourManagement),
        data: {
          roles: ['admin', 'manager'],
          title: 'Tours',
          summary: 'Manage tour packages, upcoming trips etc.',
        },
      },
      {
        path: 'pos',
        canActivate: [roleGuard],
        loadComponent: () => import('./pages/pos/pos').then((m) => m.Pos),
        data: {
          roles: ['admin'],
          title: 'POS',
          summary: 'Manage sales',
        },
      },
      {
        path: 'user-access-control',
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./pages/user-access-control/user-access-control').then(
            (m) => m.UserAccessControl,
          ),
        data: {
          roles: ['admin', 'manager'],
          title: 'User Access Control',
          summary: 'Visualize company performance and growth.',
        },
      },
    ],
  },

  // 404
  {
    path: '**',
    loadComponent: () => import('./pages/not-found-404/not-found-404').then((m) => m.NotFound404),
  },
];
