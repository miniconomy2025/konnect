import { FollowsResponse, UserProfile } from "@/types/account";
import { DiscoverSearchResponse } from "@/types/discover";
import { GetPostsResponse, PostsResponse } from "@/types/post";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LikeResponse {
  success: boolean;
  likesCount: number;
  isLiked: boolean;
}

export interface FollowResponse {
  success: boolean;
  message: string;
  following: boolean;
}

export class ApiService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...this.getSkipBrowserWarningHeaders(),
    };
  }

  private static getSkipBrowserWarningHeaders(): HeadersInit {
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      return {
        'ngrok-skip-browser-warning': 'true',
      };
    } else {
      return {};
    }
  }

  // Posts API
  static async getPosts(type: 'discover' | 'following', page: number = 1, limit: number = 10): Promise<ApiResponse<GetPostsResponse>> {
    try {
      const feedType = type === 'discover' ? 'public' : 'following';
      const response = await fetch(`${API_BASE_URL}/posts?page=${page}&limit=${limit}&type=${feedType}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getUserPosts(user: string): Promise<ApiResponse<PostsResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/user/${user}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getExternalUserPosts(username: string, domain: string): Promise<ApiResponse<PostsResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/search/posts/${username}/${domain}`, {
        headers: this.getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async likePost(postId: string): Promise<ApiResponse<LikeResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/like`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ id: postId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Auth API
  static async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async checkUsername(username: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-username/${username}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateUsername(username: string): Promise<ApiResponse<{success: boolean; message: string}>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/username`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ username }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateDisplayName(displayName: string): Promise<ApiResponse<{success: boolean; message: string}>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/display-name`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ displayName }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateBio(bio: string): Promise<ApiResponse<{success: boolean; message: string}>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/bio`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ bio }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Post creation
  static async createPost(formData: FormData): Promise<ApiResponse<{success: boolean; post: object}>> {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      if (process.env.NEXT_PUBLIC_ENV === 'development') {
        headers['ngrok-skip-browser-warning'] = 'true';
      }
      
      // Note: Don't set Content-Type for FormData - let browser set it
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updatePostCaption(id: string, caption: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ caption }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async deletePost(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }


  // Search API
  static async searchUsers(query: string, page: number = 1, limit: number = 10): Promise<ApiResponse<DiscoverSearchResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/search/users/federated?q=${query}&page=${page}&limit=${limit}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getUserByUsername(username: string): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${username}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Following
         static async followUser(user: string): Promise<ApiResponse<FollowResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/follows/follow`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 'targetUserActorID': user }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

         static async unfollowUser(user: string): Promise<ApiResponse<FollowResponse>> {
        try {
        const response = await fetch(`${API_BASE_URL}/follows/unfollow`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ 'targetUserActorID': user }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { data };
        } catch (error) {
        return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

  static async getFollowers(username: string, page: number = 1, limit: number = 10): Promise<ApiResponse<FollowsResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/follows/users/${username}?page=${page}&limit=${limit}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 