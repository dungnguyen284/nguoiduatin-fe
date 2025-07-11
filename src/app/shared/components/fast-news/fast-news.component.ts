import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService } from '../../../services/news.service';
import { Observable } from 'rxjs';
import { NewsResponseDTO } from '../../../models/news-response.model';

@Component({
  selector: 'app-fast-news',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './fast-news.component.html',
  styleUrl: './fast-news.component.css',
})
export class FastNewsComponent implements OnInit {
  topNews$!: Observable<NewsResponseDTO[]>;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.topNews$ = this.newsService.getTopLatestNews(10);
  }
}
