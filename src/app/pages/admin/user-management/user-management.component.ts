import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  UserService,
  User,
  UserCreateDto,
} from '../../../services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzTagModule,
    NzSelectModule,
    NzFormModule,
    NzInputModule,
    NzToolTipModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  isModalVisible = false;
  modalTitle = 'Thêm người dùng mới';
  editingUser: User | null = null;

  roleFilters = [
    { text: 'Admin', value: 'Admin' },
    { text: 'Journalist', value: 'Journalist' },
    { text: 'Default', value: 'Default' },
  ];

  statusFilters = [
    { text: 'Hoạt động', value: 1 },
    { text: 'Bị khóa', value: 0 },
  ];

  constructor(
    private userService: UserService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.totalItems = data.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.message.error('Không thể tải danh sách người dùng');
        this.loading = false;
        // Tạo dữ liệu giả để hiển thị UI
      },
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  getStatusText(status: number): string {
    return status === 1 ? 'Hoạt động' : 'Bị khóa';
  }

  getStatusColor(status: number): string {
    return status === 1 ? 'green' : 'red';
  }

  getRoleColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'gold';
      case 'journalist':
        return 'blue';
      case 'user':
        return 'green';
      default:
        return 'default';
    }
  }

  openAddUserModal() {
    this.modalTitle = 'Thêm người dùng mới';
    this.editingUser = null;
    this.isModalVisible = true;
  }

  openEditUserModal(user: User) {
    this.modalTitle = 'Chỉnh sửa người dùng';
    this.editingUser = { ...user };
    this.isModalVisible = true;
  }

  cancelModal() {
    this.isModalVisible = false;
  }

  saveUser() {
    if (this.editingUser) {
      // Cập nhật user
      this.userService
        .updateUser(this.editingUser.id, this.editingUser)
        .subscribe({
          next: () => {
            this.message.success('Cập nhật người dùng thành công');
            this.isModalVisible = false;
            this.loadUsers();
          },
          error: (err) => {
            console.error('Failed to update user:', err);
            this.message.error('Không thể cập nhật người dùng');
          },
        });
    } else {
      // Tạo user mới
      const newUser: UserCreateDto = {
        userName: 'newuser', // Cần được thay thế bằng dữ liệu từ form
        email: 'newuser@example.com',
        fullName: 'Người dùng mới',
        role: 'User',
        password: 'Password123!', // Trong thực tế, hãy sử dụng mật khẩu an toàn hơn
      };

      this.userService.createUser(newUser).subscribe({
        next: () => {
          this.message.success('Thêm người dùng thành công');
          this.isModalVisible = false;
          this.loadUsers();
        },
        error: (err) => {
          console.error('Failed to create user:', err);
          this.message.error('Không thể thêm người dùng');
        },
      });
    }
  }

  toggleUserStatus(user: User) {
    const newStatus = user.status === 1 ? 0 : 1;
    const action = newStatus === 1 ? 'kích hoạt' : 'khóa';

    if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      this.userService.updateUserStatus(user.id, newStatus).subscribe({
        next: () => {
          this.message.success(
            `${
              action.charAt(0).toUpperCase() + action.slice(1)
            } tài khoản thành công`
          );
          user.status = newStatus; // Cập nhật UI
        },
        error: (err) => {
          console.error(`Failed to ${action} user:`, err);
          this.message.error(`Không thể ${action} tài khoản`);
        },
      });
    }
  }

  changeUserRole(user: User, newRole: string) {
    if (
      confirm(
        `Bạn có chắc chắn muốn thay đổi vai trò của người dùng này thành ${newRole}?`
      )
    ) {
      this.userService.updateUserRole(user.id, newRole).subscribe({
        next: () => {
          this.message.success('Thay đổi vai trò thành công');
          user.role = newRole; // Cập nhật UI
        },
        error: (err) => {
          console.error('Failed to change user role:', err);
          this.message.error('Không thể thay đổi vai trò người dùng');
        },
      });
    }
  }

  deleteUser(user: User) {
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.userName}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.message.success('Xóa người dùng thành công');
          this.loadUsers(); // Tải lại danh sách
        },
        error: (err) => {
          console.error('Failed to delete user:', err);
          this.message.error('Không thể xóa người dùng');
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
