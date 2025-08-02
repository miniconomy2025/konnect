export interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
}

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
  type: 'image' | 'video' | string;
  url: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}