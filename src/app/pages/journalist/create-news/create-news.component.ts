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
import { CategoryService } from '../../../services/category.service';
import { TagService } from '../../../services/tag.service';

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

  categories: any[] = [];
  tags: any[] = [];
  categoriesLoading = false;
  tagsLoading = false;

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private message: NzMessageService,
    private sanitizer: DomSanitizer,
    private categoryService: CategoryService,
    private tagService: TagService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      imageUrl: [''], // không required nữa
      categoryId: [null, [Validators.required]],
      tagIds: [[]], // không required nữa
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
    this.fetchCategories();
    this.fetchTags();
    // CKEditor custom upload adapter
    if (typeof window !== 'undefined') {
      (window as any).CustomUploadAdapter = this.makeCustomUploadAdapter();
    }
  }

  fetchCategories() {
    this.categoriesLoading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data.data;
        this.categoriesLoading = false;
      },
      error: () => {
        this.categories = [];
        this.categoriesLoading = false;
        this.message.error('Không lấy được danh sách chuyên mục');
      },
    });
  }

  fetchTags() {
    this.tagsLoading = true;
    this.tagService.getAllTags().subscribe({
      next: (data) => {
        this.tags = data.data;
        this.tagsLoading = false;
      },
      error: () => {
        this.tags = [];
        this.tagsLoading = false;
        this.message.error('Không lấy được danh sách tag');
      },
    });
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
    const imageUrlInvalid = !this.selectedImageFile && !this.imagePreviewUrl;
    const categoryIdInvalid =
      this.form.get('categoryId')?.invalid ||
      !this.form.get('categoryId')?.value;
    // tagIds không còn required

    if (
      titleInvalid ||
      descriptionInvalid ||
      imageUrlInvalid ||
      categoryIdInvalid
    ) {
      this.form.get('title')?.markAsTouched();
      this.form.get('description')?.markAsTouched();
      this.form.get('imageUrl')?.markAsTouched();
      this.form.get('categoryId')?.markAsTouched();
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
        if (!presign?.presignedUrl)
          throw new Error('Không lấy được presigned url');
        await this.newsService
          .uploadFileToS3(presign.presignedUrl, file)
          .toPromise();
        imageUrl = `https://sc-files-storage.s3.amazonaws.com/${presign.fileKey}`;
      }
      // Deferred upload cho ảnh trong content
      let content = this.form.value.content;
      for (const img of this.pendingImages) {
        if (content.includes(img.blobUrl)) {
          const presign = await this.newsService
            .getPresignedUrl(img.file.name, img.file.type)
            .toPromise();
          if (!presign?.presignedUrl)
            throw new Error('Không lấy được presigned url');
          await this.newsService
            .uploadFileToS3(presign.presignedUrl, img.file)
            .toPromise();
          const realUrl = `https://sc-files-storage.s3.amazonaws.com/${presign.fileKey}`;
          content = content.replaceAll(img.blobUrl, realUrl);
        }
      }
      const dto: NewsCreateDTO = {
        ...this.form.value,
        imageUrl,
        content, // content đã thay thế url
        isActive: false, // luôn là false khi tạo mới
        authorId: this.authorId,
      };
      await this.newsService.createNews(dto).toPromise();
      this.message.success('Tạo tin tức thành công!');
      this.form.reset();
      this.step = 1;
      this.imagePreviewUrl = null;
      this.selectedImageFile = null;
      this.pendingImages = [];
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

  pendingImages: { file: File; blobUrl: string }[] = [];

  makeCustomUploadAdapter() {
    const pendingImages = this.pendingImages;
    return function (loader: any) {
      return {
        upload: async () => {
          const file = await loader.file;
          const blobUrl = URL.createObjectURL(file);
          pendingImages.push({ file, blobUrl });
          return { default: blobUrl };
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
