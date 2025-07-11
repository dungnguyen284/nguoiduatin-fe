import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';

interface SearchRoute {
  path: string;
  label: string;
}

@Component({
  selector: 'app-search-modal',
  standalone: true,
  templateUrl: './search-modal.component.html',
  styleUrl: './search-modal.component.css',
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatDividerModule,
    FormsModule,
  ],
})
export class SearchModalComponent {
  keyword = '';
  searchType = 'code';
  routes: SearchRoute[] = [
    { path: '/', label: 'Trang chủ' },
    { path: '/company', label: 'Doanh nghiệp' },
    { path: '/real-estate', label: 'Bất động sản' },
    { path: '/finance', label: 'Tài chính' },
    { path: '/stock', label: 'Chứng khoán' },
  ];

  constructor(
    public dialogRef: MatDialogRef<SearchModalComponent>,
    private router: Router
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  onSearch(): void {
    // Thực hiện logic tìm kiếm
    this.dialogRef.close({ keyword: this.keyword, type: this.searchType });
  }

  goto(path: string) {
    this.dialogRef.close();
    this.router.navigate([path]);
  }
}
