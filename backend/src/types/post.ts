
export interface CreatePostData {
  authorId: string;
  caption: string;
  mediaUrl: string;
  mediaType: string;
}

export interface PostResponse {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  caption: string;
  mediaUrl: string;
  mediaType: string;
  activityId: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: Date;
  updatedAt: Date;
}