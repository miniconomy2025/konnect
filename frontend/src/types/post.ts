export interface PostsResponse {
  hasMore: boolean;
  limit: number;
  page: number;
  posts: Post[];
}

export interface Post {
  id: string;
  content: Content;
  createdAt: string;
  updatedAt: string;
  author: Author;
  engagement: Engagement;
  isReply: boolean;
  media: Media;
  type: string;
  url: string;
}

export interface Content {
  text: string;
  hasMedia: boolean;
  mediaType: 'image' | 'video' | 'none' | string;
}

export interface Author {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface Engagement {
  canInteract: boolean;
  isLiked: boolean;
  likesCount: number;
}

export interface Media {
  type: 'image' | 'video' | 'text';
  url: string;
}