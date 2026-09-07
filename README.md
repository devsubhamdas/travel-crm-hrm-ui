# Travel CRM & HRM

A modern **Travel CRM & HRM (Human Resource Management) frontend application** built with Angular for managing the day-to-day operations of a travel company.

The application provides a centralized interface for managing customers, employees, and other business operations through an interactive and responsive dashboard.

## 🚀 Features

- 🔐 **Authentication**
  - User login and authentication
  - JWT-based authentication
  - Protected routes
  - Token handling using `@auth0/angular-jwt`

- 👥 **Customer Management**
  - Manage customer information
  - View and organize customer records
  - Support customer-related business operations

- 👨‍💼 **Employee Management**
  - Manage employee information
  - View employee records
  - Support internal HR operations

- 📊 **Dashboard & Analytics**
  - Business overview
  - Operational statistics
  - Data visualization using Chart.js

- 🏢 **CRM & HRM Operations**
  - Centralized management of company operations
  - Customer and employee administration
  - Extensible structure for additional business modules

- 🎨 **Modern UI**
  - Responsive interface
  - PrimeNG component library
  - Tailwind CSS
  - PrimeUI theme integration
  - Lucide icons
  - PrimeIcons

## 🛠️ Tech Stack

### Frontend

- **Angular 21**
- **TypeScript**
- **RxJS**
- **Angular Router**
- **Angular Forms**
- **Angular SSR**

### UI & Styling

- **PrimeNG**
- **PrimeUI Themes**
- **Tailwind CSS**
- **Tailwind CSS PrimeUI**
- **Lucide Angular**
- **PrimeIcons**

### Authentication

- **JWT**
- **@auth0/angular-jwt**

### Data Visualization

- **Chart.js**

### Development & Testing

- **Angular CLI**
- **TypeScript**
- **Prettier**
- **Vitest**
- **JSDOM**

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/devsubhamdas/travel-crm-hrm-ui
cd travel-crm-hrm-ui
```

Install dependencies:

```bash
npm install
```

## Environment Setup

Run this following command:

```bash
ng generate environments
```

it will generate two files `environment.ts` and `environment.development.ts` in `src/environments` directory

Basic Environment object for Development:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

Paste this object in both files and make sure your backend api running on port `3000` or change it accordingly.

## ▶️ Running the Application

Start the Angular development server (required `src/environments/environment.ts`):

```bash
npm run start
```

The application will be available at:

```text
http://localhost:4200
```

## 👀 Development Build

To automatically rebuild the application whenever source files change:

```bash
npm run watch
```

## 🏗️ Production Build

Create a production build:

```bash
npm run build
```

The generated production files will be available in the Angular build output directory.

## 🧪 Testing

Run the application's test suite:

```bash
npm test
```

The project uses **Vitest** for testing.

## 📁 Project Structure

```text
travel-crm-hrm/
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── guards/
│   │   ├── models/
│   │   └── ...
│   │
│   ├── assets/
│   └── ...
│
├── public/
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

> The exact application structure may evolve as additional CRM and HRM modules are introduced.

## 🔗 Backend API

This frontend communicates with the backend API to handle authentication, customer management, employee management, and other business operations.

**Associated Repository:**

**Backend**: [Travel CRM & HRM API](https://github.com/devsubhamdas/travel-crm-hrm-api)

Make sure the backend API is running and the frontend API configuration points to the correct backend URL.

## 🎨 UI & Design

The application uses a combination of **PrimeNG and Tailwind CSS** to provide a modern and responsive user interface.

Key UI technologies include:

- PrimeNG components
- PrimeUI themes
- Tailwind CSS utilities
- Lucide icons
- PrimeIcons
- Chart.js visualizations

## 🎯 Project Purpose

The purpose of this project is to provide a **centralized frontend application for managing a travel company's daily operations**.

The system brings CRM and HRM functionality into a single application, allowing company users to manage customers, employees, and operational information through a unified interface.

The application is designed to be modular and extensible, making it possible to introduce additional business features as the platform grows.

## 🏗️ Application Architecture

The frontend communicates with the Travel CRM & HRM backend through REST APIs.

```text
┌─────────────────────────────┐
│       Angular Frontend      │
│                             │
│  ┌─────────┐  ┌──────────┐ │
│  │   CRM   │  │   HRM    │ │
│  │ Modules │  │ Modules  │ │
│  └─────────┘  └──────────┘ │
│           │                 │
│           ▼                 │
│      Angular Services       │
└─────────────┬───────────────┘
              │
              │ HTTP / REST API
              ▼
┌─────────────────────────────┐
│    Travel CRM & HRM API     │
│          NestJS             │
└─────────────┬───────────────┘
              │
              ▼
         MariaDB
```

## 📌 Future Scope

Potential future functionality includes:

- Employee attendance
- Leave management
- Payroll management
- Customer leads and follow-ups
- Travel booking management
- Sales management
- Revenue tracking
- Notifications
- Reports and analytics
- Role-based dashboards
- Audit and activity tracking

## 📄 License

This project is licensed under the **MIT License**.
