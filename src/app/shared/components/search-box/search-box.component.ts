import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SearchModalComponent } from '../search-modal/search-modal.component';

@Component({
  selector: 'app-search-box',
  standalone: true,
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.css',
  imports: [],
})
export class SearchBoxComponent {
  @Output() search = new EventEmitter<string>();

  constructor(private dialog: MatDialog) {}

  openDialog() {
    const dialogRef = this.dialog.open(SearchModalComponent, {
      width: '500px',
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.search.emit(result);
        // Xử lý kết quả tìm kiếm ở đây nếu muốn
      }
    });
  }
}
