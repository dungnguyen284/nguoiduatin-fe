export interface NewsCreateDTO {
  title: string;
  description: string;
  content: string; // HTML string
  imageUrl: string;
  source: string;
  link: string;
  isActive: boolean; // luôn gửi false khi tạo mới
  authorId: string;
  categoryId: number;
  tagIds: number[];
}
