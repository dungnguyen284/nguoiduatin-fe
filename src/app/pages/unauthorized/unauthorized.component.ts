import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterModule, NzResultModule, NzButtonModule],
  template: `
    <div class="container">
      <nz-result
        nzStatus="403"
        nzTitle="403"
        nzSubTitle="Xin lỗi, bạn không có quyền truy cập trang này."
      >
        <div nz-result-extra>
          <button nz-button nzType="primary" routerLink="/">
            Về trang chủ
          </button>
          <button nz-button routerLink="/login">Đăng nhập</button>
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

      [nz-button] {
        margin-right: 8px;
        margin-bottom: 12px;
      }
    `,
  ],
})
export class UnauthorizedComponent {}
