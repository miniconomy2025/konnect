import type { UserProfile } from "@/types/account";
export interface CachedItem<T> {
  timestamp: number;
  value: T;
}

const isBrowser = typeof window !== 'undefined';
const RECENT_SEARCHES_KEY = 'recentSearches';
const RECENTLY_VIEWED_KEY = 'recentlyViewedUsers';

export function getSessionCache<T>(key: string, maxAgeMs: number): T | null {
  if (!isBrowser) return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedItem<T>;
    if (!parsed || typeof parsed.timestamp !== 'number') return null;
    const isFresh = Date.now() - parsed.timestamp <= maxAgeMs;
    return isFresh ? parsed.value : null;
  } catch {
    return null;
  }
}

export function setSessionCache<T>(key: string, value: T): void {
  if (!isBrowser) return;
  try {
    const payload: CachedItem<T> = { timestamp: Date.now(), value };
    sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore quota or serialization errors
  }
}

// Recent searches management (session-scoped)
export function addRecentSearch(query: string, maxItems: number = 10): void {
  if (!isBrowser) return;
  const q = query.trim();
  if (!q) return;
  try {
    const raw = sessionStorage.getItem(RECENT_SEARCHES_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((x) => x.toLowerCase() !== q.toLowerCase());
    const updated = [q, ...filtered].slice(0, maxItems);
    sessionStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getRecentSearches(): string[] {
  if (!isBrowser) return [];
  try {
    const raw = sessionStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function removeRecentSearch(query: string): void {
  if (!isBrowser) return;
  try {
    const raw = sessionStorage.getItem(RECENT_SEARCHES_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((x) => x.toLowerCase() !== query.trim().toLowerCase());
    sessionStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function clearRecentSearches(): void {
  if (!isBrowser) return;
  try {
    sessionStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}

// Recently viewed users (session-scoped)
export type RecentUser = Pick<
  UserProfile,
  'activityPubId' | 'displayName' | 'handle' | 'avatarUrl' | 'username' | 'hostServer' | 'isLocal'
>;

export function addRecentlyViewedUser(user: RecentUser, maxItems: number = 10): void {
  if (!isBrowser) return;
  try {
    const raw = sessionStorage.getItem(RECENTLY_VIEWED_KEY);
    const list: RecentUser[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(
      (u) => (u.activityPubId && user.activityPubId ? u.activityPubId !== user.activityPubId : u.handle.toLowerCase() !== user.handle.toLowerCase())
    );
    const updated = [user, ...filtered].slice(0, maxItems);
    sessionStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getRecentlyViewedUsers(): RecentUser[] {
  if (!isBrowser) return [];
  try {
    const raw = sessionStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? (JSON.parse(raw) as RecentUser[]) : [];
  } catch {
    return [];
  }
}

export function removeRecentlyViewedUser(handleOrId: string): void {
  if (!isBrowser) return;
  try {
    const raw = sessionStorage.getItem(RECENTLY_VIEWED_KEY);
    const list: RecentUser[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(
      (u) => u.handle.toLowerCase() !== handleOrId.toLowerCase() && u.activityPubId !== handleOrId
    );
    sessionStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
}

export function clearRecentlyViewedUsers(): void {
  if (!isBrowser) return;
  try {
    sessionStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch {
    // ignore
  }
}

