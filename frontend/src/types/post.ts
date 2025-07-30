export type MediaType = 'text' | 'image' | 'video';

export interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  caption?: string;
  mediaUrl?: string;
  mediaType: MediaType;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}