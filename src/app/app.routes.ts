import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { CompanyComponent } from './pages/company/company.component';
import { FinanceComponent } from './pages/finance/finance.component';
import { StockComponent } from './pages/stock/stock.component';
import { RealEstateComponent } from './pages/real-estate/real-estate.component';
import { NewsDetailComponent } from './pages/news-detail/news-detail.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

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
];
