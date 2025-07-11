import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../shared/components/header/header.component';
import { MainNavComponent } from '../shared/components/main-nav/main-nav.component';
import { AdBannerComponent } from '../shared/components/ad-banner/ad-banner.component';
import { FastNewsComponent } from '../shared/components/fast-news/fast-news.component';
import { StockIndexComponent } from '../shared/components/stock-index/stock-index.component';
import { MarketSummaryComponent } from '../shared/components/market-summary/market-summary.component';
import { SearchBoxComponent } from '../shared/components/search-box/search-box.component';
import { MostReadComponent } from '../shared/components/most-read/most-read.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  styleUrl: './main-layout.component.css',
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    MainNavComponent,
    AdBannerComponent,
    FastNewsComponent,
    StockIndexComponent,
    MarketSummaryComponent,
    SearchBoxComponent,
    MostReadComponent,
    FooterComponent,
    NzLayoutModule,
    NzGridModule,
  ],
  template: `
    <nz-layout>
      <nz-header style="background: #fff; padding: 0">
        <app-header></app-header>
      </nz-header>
      <div style="width: 100vw; background-color: #fff">
        <nz-row gutter="16" class="container">
          <nz-col nzSpan="8"><app-fast-news></app-fast-news></nz-col>
          <nz-col nzSpan="8"><app-stock-index></app-stock-index></nz-col>
          <nz-col nzSpan="8"><app-market-summary></app-market-summary></nz-col>
        </nz-row>
      </div>
      <nz-content>
        <app-main-nav></app-main-nav>
        <div class="container">
          <app-ad-banner></app-ad-banner>
          <nz-row gutter="24">
            <nz-col nzSpan="18">
              <main style="min-height: 1000px; margin-right: 8px">
                <router-outlet />
              </main>
            </nz-col>
            <nz-col nzSpan="6">
              <div class="sidebar-box">
                <app-search-box></app-search-box>
                <app-most-read></app-most-read>
                <div class="ad-small">Quảng cáo nhỏ</div>
              </div>
            </nz-col>
          </nz-row>
        </div>
      </nz-content>
      <app-footer></app-footer>
    </nz-layout>
  `,
})
export class MainLayoutComponent {}
