import { Component, OnInit } from '@angular/core';
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
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { TagService } from '../../../services/tag.service';

@Component({
  selector: 'app-edit-news',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CKEditorModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
  ],
  templateUrl: './edit-news.component.html',
  styleUrl: './edit-news.component.css',
})
export class EditNewsComponent implements OnInit {
  form: FormGroup;
  editor: any = null;
  isLoading = false;
  newsId: string = '';
  imagePreviewUrl: string | null = null;
  selectedImageFile: File | null = null;
  imageUploading = false;
  categories: any[] = [];
  tags: any[] = [];
  categoriesLoading = false;
  tagsLoading = false;
  pendingImages: { file: File; blobUrl: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private newsService: NewsService,
    private message: NzMessageService,
    private sanitizer: DomSanitizer,
    private categoryService: CategoryService,
    private tagService: TagService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      imageUrl: [''],
      categoryId: [null, [Validators.required]],
      tagIds: [[]],
      content: ['', [Validators.required]],
    });
    if (typeof window !== 'undefined') {
      import('@ckeditor/ckeditor5-build-classic').then((module) => {
        this.editor = module.default;
      });
    }
  }

  ngOnInit() {
    this.newsId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchCategories();
    this.fetchTags();
    if (this.newsId) {
      this.loadDraft(this.newsId);
    }
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
        this.tags = data;
        this.tagsLoading = false;
      },
      error: () => {
        this.tags = [];
        this.tagsLoading = false;
        this.message.error('Không lấy được danh sách tag');
      },
    });
  }

  loadDraft(id: string) {
    this.isLoading = true;
    this.newsService.getNewsById(id).subscribe({
      next: (res) => {
        const news = res.data || res;
        this.form.patchValue({
          title: news.title,
          description: news.description,
          imageUrl: news.imageUrl,
          categoryId: news.categoryId,
          tagIds: news.tags?.map((t: any) => t.id) || [],
          content: news.content,
        });
        if (news.imageUrl) {
          this.imagePreviewUrl = news.imageUrl;
        }
        this.isLoading = false;
      },
      error: () => {
        this.message.error('Không lấy được dữ liệu nháp');
        this.isLoading = false;
      },
    });
  }

  async submit() {
    if (this.form.get('content')?.invalid) {
      this.form.get('content')?.markAsTouched();
      return;
    }
    this.isLoading = true;
    try {
      let imageUrl = this.form.value.imageUrl;
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
        content,
        status: 1, // ACTIVE khi đăng
        // giữ lại các trường khác nếu cần
      };
      await this.newsService.editNews(this.newsId, dto).toPromise();
      this.message.success('Cập nhật và đăng tin thành công!');
      this.router.navigate(['/journalist/my-news']);
    } catch (err) {
      this.message.error('Cập nhật tin thất bại!');
    } finally {
      this.isLoading = false;
    }
  }

  async saveDraft() {
    if (this.form.get('content')?.invalid) {
      this.form.get('content')?.markAsTouched();
      return;
    }
    this.isLoading = true;
    try {
      let imageUrl = this.form.value.imageUrl;
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
        content,
        status: 2, // DRAFT khi lưu nháp
      };
      await this.newsService.editNews(this.newsId, dto).toPromise();
      this.message.success('Lưu nháp thành công!');
      this.router.navigate(['/journalist/drafts']);
    } catch (err) {
      this.message.error('Lưu nháp thất bại!');
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
    this.form.patchValue({ imageUrl: '' });
  }

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
    editor.plugins.get('FileRepository').createUploadAdapter = (
      loader: any
    ) => {
      return (window as any).CustomUploadAdapter(loader);
    };
  }

  get f() {
    return this.form.controls;
  }
}
