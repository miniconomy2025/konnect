export interface GetPostsResponse {
  hasMore: boolean;
  limit: number;
  page: number;
  posts: UnifiedPostResponse[];
  sources: {
    external: number;
    local: number;
  };
  type: "external" | "local";
}

export interface UnifiedPostResponse {
  id: string;                    
  type: 'local' | 'external';    
  
  author: {
    id: string;                  
    username: string;
    domain: string;              
    displayName: string;
    avatarUrl?: string;
    isLocal: boolean;
  };
  
  content: {
    text: string;                
    hasMedia: boolean;
    mediaType?: 'image' | 'video' | null;
  };
  
  media?: {
    type: 'image' | 'video';
    url: string;
    width?: number;
    height?: number;
    altText?: string;
  };
  
  engagement: {
    likesCount: number;          
    isLiked: boolean;           
    canInteract: boolean;       
  };
  
  createdAt: string;
  updatedAt?: string | null;
  url?: string;                  
  isReply: boolean;
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
  type: 'image' | 'video' | 'text';
  url: string;
}