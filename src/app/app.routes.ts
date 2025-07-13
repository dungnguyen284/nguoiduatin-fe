import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { DashboardLayoutComponent } from './layouts/dashboard-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { CompanyComponent } from './pages/company/company.component';
import { FinanceComponent } from './pages/finance/finance.component';
import { StockComponent } from './pages/stock/stock.component';
import { RealEstateComponent } from './pages/real-estate/real-estate.component';
import { NewsDetailComponent } from './pages/news-detail/news-detail.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { JournalistDashboardComponent } from './pages/journalist/journalist-dashboard/journalist-dashboard.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { CreateNewsComponent } from './shared/components/create-news/create-news.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'company', component: CompanyComponent },
      { path: 'real-estate', component: RealEstateComponent },
      { path: 'finance', component: FinanceComponent },
      { path: 'stock', component: StockComponent },
      { path: 'news/:id', component: NewsDetailComponent },
    ],
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Journalist Dashboard Routes
  {
    path: 'journalist',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: JournalistDashboardComponent },
      { path: 'my-news', component: JournalistDashboardComponent }, // Placeholder
      { path: 'create-news', component: CreateNewsComponent },
      { path: 'drafts', component: JournalistDashboardComponent }, // Placeholder
      { path: 'statistics', component: JournalistDashboardComponent }, // Placeholder
      { path: 'profile', component: JournalistDashboardComponent }, // Placeholder
    ],
  },
  // Admin Dashboard Routes
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: AdminDashboardComponent }, // Placeholder
      { path: 'news', component: AdminDashboardComponent }, // Placeholder
      { path: 'news/pending', component: AdminDashboardComponent }, // Placeholder
      { path: 'news/rejected', component: AdminDashboardComponent }, // Placeholder
      { path: 'categories', component: AdminDashboardComponent }, // Placeholder
      { path: 'settings', component: AdminDashboardComponent }, // Placeholder
    ],
  },
  // Profile route (accessible from header)
  { path: 'profile', component: LoginComponent }, // Placeholder - redirect to login if not authenticated
];
