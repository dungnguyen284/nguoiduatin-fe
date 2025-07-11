import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzGridModule,
    NzCardModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  protected title = 'nguoi-dua-tin-fe';
}
