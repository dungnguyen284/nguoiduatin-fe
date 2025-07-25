import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule, NzResultModule, NzButtonModule],
  template: `
    <div class="container">
      <nz-result
        nzStatus="404"
        nzTitle="404"
        nzSubTitle="Xin lỗi, trang bạn truy cập không tồn tại."
      >
        <div nz-result-extra>
          <button nz-button nzType="primary" routerLink="/">
            Về trang chủ
          </button>
        </div>
      </nz-result>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 40px 0;
        min-height: 500px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class NotFoundComponent {}
