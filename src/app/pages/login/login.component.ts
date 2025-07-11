import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzCheckboxModule,
    NzDividerModule,
    NzIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm = {
    username: '',
    password: '',
    rememberMe: false,
  };
  loading = false;
  userRole: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit(): void {
    this.loading = true;
    this.authService
      .login(this.loginForm.username, this.loginForm.password)
      .subscribe({
        next: (response) => {
          if (
            response &&
            response.isSuccess &&
            response.statusCode === 200 &&
            response.data
          ) {
            this.userRole = this.authService.getUserRole();
            this.router.navigate(['/']);
          } else {
            // handle error (show message)
          }
          this.loading = false;
        },
        error: () => {
          // handle error (show message)
          this.loading = false;
        },
      });
  }
}
