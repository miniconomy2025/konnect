'use client';

import PublicProfileView from '@/components/Discover/PublicProfile';
import { UserCard } from '@/components/Discover/UserCard';
import { Header } from '@/components/Home/Header';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { useToastHelpers } from '@/contexts/ToastContext';
import Layout from '@/layouts/Main';
import { ApiService } from '@/lib/api';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
import { clearRecentSearches, clearRecentlyViewedUsers, getRecentSearches, getRecentlyViewedUsers, removeRecentSearch } from '@/lib/sessionCache';
import { UserProfile } from '@/types/account';
import { SearchIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

const DiscoverPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<ReturnType<typeof getRecentlyViewedUsers>>([]);
  const [usernameParam, setUsernameParam] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const { error: showError } = useToastHelpers();

    useEffect(() => {
        if(!sessionStorage.getItem('auth_token')){
            showError('Please login first to discover users!', {
                action: {
                    label: 'Go to Login',
                    onClick: () => window.location.href = '/Login'
                }
            });
            window.location.href = '/Login';
        }
    }, [showError]);

    useEffect(() => {
        if(searchParams){
            const user = searchParams.get('user');
            setUsernameParam(user);
        }
    }, [searchParams]);

  // Debounced search with abort
  useEffect(() => {
    setRecent(getRecentSearches());
    setRecentlyViewed(getRecentlyViewedUsers());
    const query = searchQuery.trim();
    setErrorText(null);
    setPage(1);
    if (!query) {
      setResults([]);
      setHasMore(false);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data, error } = await ApiService.searchUsers(query, 1, 10, controller.signal);
        if (error) {
          setErrorText(error);
          setResults([]);
          setHasMore(false);
          return;
        }
        if (data) {
          setResults(data.results);
          setHasMore(data.hasMore);
        }
      } catch (err) {
        // ignore abort errors
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    const nextPage = page + 1;
    setIsLoading(true);
    setErrorText(null);
    try {
      const { data, error } = await ApiService.searchUsers(searchQuery.trim(), nextPage, 10);
      if (error) {
        setErrorText(error);
        return;
      }
      if (data) {
        setResults(prev => [...prev, ...data.results]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    <Layout>
      <main
        style={{
          background: Color.Background,
          minHeight: '100vh'
        }}
      >
        <Header
            editProfile={false}
            onSettingsClick={()=>{}}
        />
        {usernameParam ? (
        <PublicProfileView username={usernameParam}/>
        ) : (
        <>
          <div
            style={{
              maxWidth: 960,
              margin: '0 auto',
              padding: `${Spacing.Medium}`,
            }}
          >
            <section
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: Spacing.XSmall,
                background: Color.Surface,
                border: `1px solid ${searchFocused ? Color.Primary : Color.Border}`,
                borderRadius: 999,
                padding: `${Spacing.Small} ${Spacing.Medium}`,
                boxShadow: searchFocused ? '0 0 0 4px rgba(0,122,255,0.12)' : '0 2px 8px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 1,
              }}
              onFocusCapture={() => setSearchFocused(true)}
              onBlurCapture={() => setSearchFocused(false)}
            >
              <SearchIcon size={20} color={searchFocused ? Color.Primary : Color.Secondary} />
              <label
                htmlFor="discover-search"
                style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)' }}
              >
                Search users
              </label>
              <input
                  id="discover-search"
                  type="text"
                  role="searchbox"
                  placeholder="Search users..."
                  autoComplete="off"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    fontFamily: FontFamily.Nunito,
                    fontSize: FontSize.Large,
                    background: 'transparent',
                    color: Color.Text,
                    padding: `${Spacing.XSmall} 0`,
                    minWidth: 0,
                  }}
                  aria-label="Search users"
              />
              {!!searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  style={{
                    border: `1px solid ${Color.Border}`,
                    background: Color.Surface,
                    color: Color.Muted,
                    borderRadius: '50%',
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              )}
            </section>

            {!searchQuery.trim() && recent.length > 0 && (
              <section style={{ marginTop: Spacing.Large }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.Small }}>
                  <h3 style={{
                    margin: 0,
                    fontFamily: FontFamily.Nunito,
                    fontSize: FontSize.Large,
                    color: Color.Text,
                  }}>Recent searches</h3>
                  <button
                    type="button"
                    onClick={() => { clearRecentSearches(); setRecent([]); }}
                    style={{
                      border: `1px solid ${Color.Border}`,
                      background: Color.Surface,
                      color: Color.Muted,
                      cursor: 'pointer',
                      fontFamily: FontFamily.Nunito,
                      borderRadius: 999,
                      padding: '10px 14px',
                      minHeight: 44,
                    }}
                  >
                    Clear all
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: Spacing.Small }}>
                  {recent.map((q) => (
                    <div
                      key={q}
                      role="group"
                      aria-label={`Recent search ${q}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: Color.Surface,
                        border: `1px solid ${Color.Border}`,
                        borderRadius: 999,
                        padding: '4px 6px',
                        gap: Spacing.XSmall,
                        minHeight: 36,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSearchQuery(q)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: Color.Text,
                          cursor: 'pointer',
                          fontFamily: FontFamily.Nunito,
                          fontSize: FontSize.Base,
                          lineHeight: 1,
                          padding: '4px 6px',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        aria-label={`Search for ${q}`}
                      >
                        {q}
                      </button>
                      <button
                        type="button"
                        onClick={() => { removeRecentSearch(q); setRecent(getRecentSearches()); }}
                        aria-label={`Remove ${q} from recent searches`}
                        style={{
                          border: `1px solid ${Color.Border}`,
                          background: Color.Surface,
                          color: Color.Muted,
                          cursor: 'pointer',
                          fontFamily: FontFamily.Nunito,
                          fontSize: FontSize.Base,
                          width: 28,
                          height: 28,
                          boxSizing: 'border-box',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!searchQuery.trim() && recentlyViewed.length > 0 && (
              <section style={{ marginTop: Spacing.Large }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.Small }}>
                  <h3 style={{
                    margin: 0,
                    fontFamily: FontFamily.Nunito,
                    fontSize: FontSize.Large,
                    color: Color.Text,
                  }}>Recently viewed</h3>
                  <button
                    type="button"
                    onClick={() => { clearRecentlyViewedUsers(); setRecentlyViewed([]); }}
                    style={{
                      border: `1px solid ${Color.Border}`,
                      background: Color.Surface,
                      color: Color.Muted,
                      cursor: 'pointer',
                      fontFamily: FontFamily.Nunito,
                      borderRadius: 999,
                      padding: '10px 14px',
                      minHeight: 44,
                    }}
                  >
                    Clear all
                  </button>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: Spacing.Medium,
                }}>
                  {recentlyViewed.map((u) => (
                    <UserCard key={u.activityPubId ?? u.handle} user={u} />
                  ))}
                </div>
              </section>
            )}

            <section style={{ marginTop: Spacing.Large }}>
              <div aria-live="polite" aria-atomic="true" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)' }}>
                {isLoading ? 'Loading results' : ''}
              </div>

              {errorText && (
                <p style={{
                  fontFamily: FontFamily.Nunito,
                  fontSize: FontSize.Base,
                  color: Color.Error,
                  marginTop: Spacing.Small,
                }}>
                  {errorText}
                </p>
              )}

              {!isLoading && results.length === 0 && searchQuery.trim() && !errorText && (
                <p style={{
                  fontFamily: FontFamily.Nunito,
                  fontSize: FontSize.Large,
                  color: Color.Muted,
                  marginTop: Spacing.Small,
                }}>
                  No users found.
                </p>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: Spacing.Medium,
                }}
              >
                {isLoading && (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={`skeleton-${i}`} style={{
                      background: Color.Surface,
                      border: `1px solid ${Color.Border}`,
                      borderRadius: 10,
                      padding: Spacing.Medium,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: Spacing.Small }}>
                        <Skeleton width={48} height={48} circle />
                        <div style={{ flex: 1 }}>
                          <Skeleton width="70%" height={16} />
                          <Skeleton width="50%" height={12} style={{ marginTop: 6 }} />
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {!isLoading && results.map(user => (
                  <UserCard key={user.activityPubId} user={user} />
                ))}
              </div>

              {!isLoading && hasMore && results.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: Spacing.Large }}>
                  <button
                    type="button"
                    onClick={loadMore}
                    style={{
                      border: 'none',
                      background: Color.Primary,
                      color: '#fff',
                      borderRadius: 999,
                      padding: '10px 18px',
                      cursor: 'pointer',
                      fontFamily: FontFamily.Nunito,
                      fontSize: FontSize.Base,
                    }}
                  >
                    Load more
                  </button>
                </div>
              )}
            </section>
          </div>
        </>
        )}
      </main>
    </Layout>
  );
};

export default DiscoverPage;