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
import { CreateNewsComponent } from './pages/journalist/create-news/create-news.component';
import { MyNewsComponent } from './pages/journalist/my-news/my-news.component';
import { DraftNewsComponent } from './pages/journalist/draft-news/draft-news.component';
import { EditNewsComponent } from './pages/journalist/edit-news/edit-news.component';
import { NewsManagementComponent } from './pages/admin/news-management/news-management.component';
import { FeatureNewsManagementComponent } from './pages/admin/news-management/feature-news-management/feature-news-management.component';
import { UserManagementComponent } from './pages/admin/user-management/user-management.component';
import { TagManagementComponent } from './pages/admin/tag-management/tag-management.component';
import { StockManagementComponent } from './pages/admin/stock-management/stock-management.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
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
    canActivate: [authGuard, roleGuard(['Journalist', 'Admin'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: JournalistDashboardComponent },
      { path: 'my-news', component: MyNewsComponent }, // Placeholder
      { path: 'create-news', component: CreateNewsComponent },
      { path: 'edit-news/:id', component: EditNewsComponent },
      { path: 'drafts', component: DraftNewsComponent }, // Placeholder
      { path: 'profile', component: JournalistDashboardComponent }, // Placeholder
    ],
  },
  // Admin Dashboard Routes
  {
    path: 'admin',
    component: DashboardLayoutComponent,
    canActivate: [authGuard, roleGuard(['Admin'])],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'news', component: NewsManagementComponent },
      { path: 'news/feature', component: FeatureNewsManagementComponent },
      { path: 'news/pending', component: AdminDashboardComponent }, // Placeholder
      { path: 'news/rejected', component: AdminDashboardComponent }, // Placeholder
      { path: 'tags', component: TagManagementComponent }, // Placeholder
      { path: 'stocks', component: StockManagementComponent }, // Placeholder
    ],
  },
  // Profile route (accessible from header)
  { path: 'profile', component: LoginComponent }, // Placeholder - redirect to login if not authenticated

  // Error pages
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', component: NotFoundComponent }, // Wildcard route for 404 (always keep this last)
];
