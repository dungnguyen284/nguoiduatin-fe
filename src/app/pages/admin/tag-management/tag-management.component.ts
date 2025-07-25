import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TagService, Tag } from '../../../services/tag.service';

@Component({
  selector: 'app-tag-management',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './tag-management.component.html',
  styleUrl: './tag-management.component.css',
})
export class TagManagementComponent implements OnInit {
  tags: Tag[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  isModalVisible = false;
  modalTitle = 'Thêm tag mới';
  editingTag: Tag | null = null;
  newTagName: string = '';

  constructor(
    public tagService: TagService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadTags();
  }

  loadTags() {
    this.loading = true;
    this.tagService.getAllTags().subscribe({
      next: (data) => {
        this.tags = data || [];
        this.totalItems = this.tags.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tags:', err);
        this.message.error('Không thể tải danh sách tag');
        this.loading = false;
        this.totalItems = this.tags.length;
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadTags();
  }

  openAddTagModal() {
    this.modalTitle = 'Thêm tag mới';
    this.editingTag = null;
    this.newTagName = '';
    this.isModalVisible = true;
  }

  openEditTagModal(tag: Tag) {
    this.modalTitle = 'Chỉnh sửa tag';
    this.editingTag = { ...tag };
    this.newTagName = tag.name;
    this.isModalVisible = true;
  }

  cancelModal() {
    this.isModalVisible = false;
  }

  saveTag() {
    if (!this.newTagName.trim()) {
      this.message.error('Tên tag không được để trống');
      return;
    }

    if (this.editingTag) {
      // Cập nhật tag
      const updatedTag = {
        ...this.editingTag,
        name: this.newTagName,
      };

      this.tagService.updateTag(this.editingTag.id, updatedTag).subscribe({
        next: () => {
          this.message.success('Cập nhật tag thành công');
          this.isModalVisible = false;
          this.loadTags();
        },
        error: (err) => {
          console.error('Failed to update tag:', err);
          this.message.error('Không thể cập nhật tag');
        },
      });
    } else {
      // Tạo tag mới
      const newTag = {
        name: this.newTagName,
      };

      this.tagService.createTag(newTag).subscribe({
        next: () => {
          this.message.success('Thêm tag thành công');
          this.isModalVisible = false;
          this.loadTags();
        },
        error: (err) => {
          console.error('Failed to create tag:', err);
          this.message.error('Không thể thêm tag mới');
        },
      });
    }
  }

  deleteTag(tag: Tag) {
    if (confirm(`Bạn có chắc chắn muốn xóa tag "${tag.name}"?`)) {
      this.tagService.deleteTag(tag.id).subscribe({
        next: () => {
          this.message.success('Xóa tag thành công');
          this.loadTags();
        },
        error: (err) => {
          console.error('Failed to delete tag:', err);
          this.message.error('Không thể xóa tag');
        },
      });
    }
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
