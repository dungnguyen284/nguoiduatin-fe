export interface TagResponseDTO {
  id: number;
  name: string;
}

export interface NewsResponseDTO {
  id: number;
  title: string;
  description: string;
  publicationDate: string;
  link: string;
  imageUrl: string;
  source: string;
  status: number; // 0: ACTIVE, 1: INACTIVE, 2: DRAFT
  isFrontPage: boolean;
  slotNumber: number;
  content: string;
  authorId: string;
  authorName: string;
  categoryId: number;
  categoryName: string;
  tags: TagResponseDTO[];
  viewCount: number; // số lượt xem
}
