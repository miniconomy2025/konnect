export interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
}

export interface Post {
  id: number;
  image: string;
  likes: number;
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