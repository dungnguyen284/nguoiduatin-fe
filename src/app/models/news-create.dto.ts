export interface NewsCreateDTO {
  title: string;
  description: string;
  content: string; // HTML string
  imageUrl: string;
  source: string;
  link: string;
  status: number; // 0: ACTIVE, 1: INACTIVE, 2: DRAFT
  authorId: string;
  categoryId: number;
  tagIds: number[];
}
