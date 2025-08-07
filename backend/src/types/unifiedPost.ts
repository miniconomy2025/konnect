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