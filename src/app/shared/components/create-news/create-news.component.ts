import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NewsService } from '../../../services/news.service';
import { NewsCreateDTO } from '../../../models/news-create.dto';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-news',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
  ],
  templateUrl: './create-news.component.html',
  styleUrl: './create-news.component.css',
})
export class CreateNewsComponent implements OnInit {
  @Output() newsCreated = new EventEmitter<void>();

  form: FormGroup;
  editor: any = null;
  isLoading = false;
  step = 1;
  authorId: string = '';
  imagePreviewUrl: string | null = null;
  selectedImageFile: File | null = null;
  imageUploading = false;

  // Dummy data for select (cần thay bằng API thực tế)
  categories = [
    { id: 1, name: 'Thời sự' },
    { id: 2, name: 'Kinh tế' },
    { id: 3, name: 'Thể thao' },
  ];
  tags = [
    { id: 1, name: 'Nóng' },
    { id: 2, name: 'Tin mới' },
    { id: 3, name: 'Phân tích' },
  ];

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private message: NzMessageService,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      imageUrl: [''], // không required nữa
      categoryId: [null, [Validators.required]],
      tagIds: [[], [Validators.required]],
      content: ['', [Validators.required]],
    });

    // Dynamic import CKEditor chỉ khi có window (client-side)
    if (typeof window !== 'undefined') {
      import('@ckeditor/ckeditor5-build-classic').then((module) => {
        this.editor = module.default;
      });
    }
  }

  ngOnInit() {
    this.authorId = this.getAuthorIdFromToken();
    // CKEditor custom upload adapter
    if (typeof window !== 'undefined') {
      (window as any).CustomUploadAdapter = this.makeCustomUploadAdapter();
    }
  }

  getAuthorIdFromToken(): string {
    const token =
      sessionStorage.getItem('jwt_token') || localStorage.getItem('jwt_token');
    if (!token) return '';
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded['nameidentifier'] || decoded['sub'] || '';
    } catch {
      return '';
    }
  }

  nextStep() {
    const titleInvalid = this.form.get('title')?.invalid;
    const descriptionInvalid = this.form.get('description')?.invalid;
    const imageUrlInvalid = this.form.get('imageUrl')?.invalid;
    const categoryIdInvalid =
      this.form.get('categoryId')?.invalid ||
      !this.form.get('categoryId')?.value;
    const tagIdsValue = this.form.get('tagIds')?.value;
    const tagIdsInvalid =
      !tagIdsValue || !Array.isArray(tagIdsValue) || tagIdsValue.length === 0;

    if (
      titleInvalid ||
      descriptionInvalid ||
      imageUrlInvalid ||
      categoryIdInvalid ||
      tagIdsInvalid
    ) {
      this.form.get('title')?.markAsTouched();
      this.form.get('description')?.markAsTouched();
      this.form.get('imageUrl')?.markAsTouched();
      this.form.get('categoryId')?.markAsTouched();
      this.form.get('tagIds')?.markAsTouched();
      return;
    }
    this.step = 2;
  }

  async submit() {
    if (this.form.get('content')?.invalid) {
      this.form.get('content')?.markAsTouched();
      return;
    }
    this.isLoading = true;
    try {
      let imageUrl = this.form.value.imageUrl;
      // Nếu có file ảnh bìa, upload lên S3 trước khi gửi bài
      if (this.selectedImageFile) {
        const file = this.selectedImageFile;
        const presign = await this.newsService
          .getPresignedUrl(file.name, file.type)
          .toPromise();
        if (!presign?.url) throw new Error('Không lấy được presigned url');
        await this.newsService.uploadFileToS3(presign.url, file).toPromise();
        imageUrl = `https://your-bucket.s3.amazonaws.com/${presign.key}`;
      }
      const dto: NewsCreateDTO = {
        ...this.form.value,
        imageUrl,
        isActive: false, // luôn là false khi tạo mới
        authorId: this.authorId,
      };
      await this.newsService.createNews(dto).toPromise();
      this.message.success('Tạo tin tức thành công!');
      this.form.reset();
      this.step = 1;
      this.imagePreviewUrl = null;
      this.selectedImageFile = null;
      this.newsCreated.emit();
    } catch (err) {
      this.message.error('Tạo tin tức thất bại!');
    } finally {
      this.isLoading = false;
    }
  }

  async onImageFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.selectedImageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
    // Không upload ở đây nữa
    this.form.patchValue({ imageUrl: '' }); // reset giá trị để validate lại
  }

  makeCustomUploadAdapter() {
    const newsService = this.newsService;
    return function (loader: any) {
      return {
        upload: async () => {
          return new Promise(async (resolve, reject) => {
            try {
              const file = await loader.file;
              // Lấy presigned url
              const presign = await newsService
                .getPresignedUrl(file.name, file.type)
                .toPromise();
              if (!presign?.url)
                throw new Error('Không lấy được presigned url');
              await newsService.uploadFileToS3(presign.url, file).toPromise();
              // Link public: presign.key hoặc build từ key tuỳ cấu hình S3
              const publicUrl = `https://your-bucket.s3.amazonaws.com/${presign.key}`;
              resolve({ default: publicUrl });
            } catch (err) {
              reject(err);
            }
          });
        },
      };
    };
  }

  onReady(editor: any) {
    // Gán custom upload adapter cho CKEditor
    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    ) => {
      return (window as any).CustomUploadAdapter(loader);
    };
  }

  // Tiện ích cho template
  get f() {
    return this.form.controls;
  }
}
