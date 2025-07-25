import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { StockService, Stock } from '../../../services/stock.service';

@Component({
  selector: 'app-stock-management',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzTagModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './stock-management.component.html',
  styleUrl: './stock-management.component.css',
})
export class StockManagementComponent implements OnInit {
  stocks: Stock[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  isModalVisible = false;
  modalTitle = 'Thêm cổ phiếu mới';
  editingStock: Stock | null = null;
  stockForm: FormGroup;
  searchText = '';
  searchTimeout: any = null;

  constructor(
    private stockService: StockService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {
    this.stockForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('[A-Z0-9]{2,6}')]],
      name: ['', [Validators.required]],
      companyDescription: ['', [Validators.required]],
      logoUrl: [''],
    });
  }

  ngOnInit(): void {
    this.loadStocks();
  }

  loadStocks() {
    this.loading = true;
    const skip = (this.currentPage - 1) * this.pageSize;

    // Đầu tiên, lấy tổng số cổ phiếu để phân trang chính xác
    this.getTotalStocksCount().then((total) => {
      this.totalItems = total;

      // Sau đó lấy dữ liệu cho trang hiện tại, sử dụng OData
      this.stockService
        .getStocksPaged(skip, this.pageSize, this.searchText)
        .subscribe({
          next: (result) => {
            console.log('Stocks loaded:', result);
            this.stocks = result.data;
            this.loading = false;
          },
          error: (err) => {
            console.error('Failed to load stocks:', err);
            this.message.error('Không thể tải danh sách cổ phiếu');
            this.loading = false;
          },
        });
    });
  }

  // Phương thức để lấy tổng số cổ phiếu cho phân trang
  async getTotalStocksCount(): Promise<number> {
    return new Promise<number>((resolve) => {
      // Sử dụng OData để lấy tổng số cổ phiếu phù hợp với điều kiện tìm kiếm
      this.stockService.getAllStocks(this.searchText).subscribe({
        next: (result) => {
          resolve(result.data.length);
        },
        error: () => resolve(0), // Nếu lỗi, giả định không có cổ phiếu nào
      });
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadStocks();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1; // Reset về trang đầu khi thay đổi số lượng hiển thị
    this.loadStocks();
  }

  onSearch(value: string) {
    // Dùng debounce để tránh gọi API liên tục khi người dùng nhập nhanh
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      // Làm sạch giá trị tìm kiếm để tương thích với OData
      this.searchText = value ? value.trim() : '';
      this.currentPage = 1; // Reset về trang đầu khi tìm kiếm
      this.loadStocks();
    }, 500);
  }

  openAddStockModal() {
    this.modalTitle = 'Thêm cổ phiếu mới';
    this.editingStock = null;
    this.stockForm.reset({
      code: '',
      name: '',
      companyDescription: '',
      logoUrl: '',
    });
    this.isModalVisible = true;
  }

  openEditStockModal(stock: Stock) {
    this.modalTitle = 'Chỉnh sửa cổ phiếu';
    this.editingStock = { ...stock };
    this.stockForm.patchValue({
      code: stock.code,
      name: stock.name,
      companyDescription: stock.companyDescription,
      logoUrl: stock.logoUrl || '',
    });
    this.isModalVisible = true;
  }

  cancelModal() {
    this.isModalVisible = false;
  }

  saveStock() {
    if (this.stockForm.invalid) {
      for (const i in this.stockForm.controls) {
        this.stockForm.controls[i].markAsDirty();
        this.stockForm.controls[i].updateValueAndValidity();
      }
      return;
    }

    const stockData = this.stockForm.value;

    if (this.editingStock) {
      // Cập nhật cổ phiếu
      this.stockService.updateStock(this.editingStock.id, stockData).subscribe({
        next: () => {
          this.message.success('Cập nhật cổ phiếu thành công');
          this.isModalVisible = false;
          this.loadStocks();
        },
        error: (err) => {
          console.error('Failed to update stock:', err);
          this.message.error('Không thể cập nhật cổ phiếu');
        },
      });
    } else {
      // Tạo cổ phiếu mới
      this.stockService.createStock(stockData).subscribe({
        next: () => {
          this.message.success('Thêm cổ phiếu thành công');
          this.isModalVisible = false;
          this.loadStocks();
        },
        error: (err) => {
          console.error('Failed to create stock:', err);
          this.message.error('Không thể thêm cổ phiếu mới');
        },
      });
    }
  }

  deleteStock(stock: Stock) {
    if (confirm(`Bạn có chắc chắn muốn xóa cổ phiếu ${stock.code}?`)) {
      this.stockService.deleteStock(stock.id).subscribe({
        next: () => {
          this.message.success('Xóa cổ phiếu thành công');
          this.loadStocks();
        },
        error: (err) => {
          console.error('Failed to delete stock:', err);
          this.message.error('Không thể xóa cổ phiếu');
        },
      });
    }
  }

  getLogoUrl(url: string): string {
    return url && url.trim() !== ''
      ? url
      : 'assets/images/stock-placeholder.png';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
