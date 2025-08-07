'use client';

import PublicProfileView from '@/components/Discover/PublicProfile';
import { UserCard } from '@/components/Discover/UserCard';
import { Header } from '@/components/Home/Header';
import { useToastHelpers } from '@/contexts/ToastContext';
import Layout from '@/layouts/Main';
import { ApiService } from '@/lib/api';
import { Color, FontFamily, FontSize, Spacing } from '@/lib/presentation';
import { UserProfile } from '@/types/account';
import { SearchIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const DiscoverPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]); 
  const [usernameParam, setUsernameParam] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const { error: showError } = useToastHelpers();

    useEffect(() => {
        if(!localStorage.getItem('auth_token')){
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

  useEffect(() => {
    if (searchQuery.trim()) {
        const fetchData = async () => {
            const { data: response } = await ApiService.searchUsers(searchQuery);
            if(response){
                setResults(response.results);
            }
        }
        fetchData();
    } else {
      setResults([]);
    }
  }, [searchQuery]);

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
            <section
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: Spacing.XSmall,
                background: Color.Surface,
                border: `1px solid ${Color.Border}`,
                borderRadius: 8,
                padding: Spacing.Small,
                margin: Spacing.Medium,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}
            >
            <SearchIcon size={20} color={Color.Secondary} />
            <input
                type="text"
                placeholder="Search users..."
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
                marginLeft: Spacing.Small,
                }}
            />
            </section>

            <section style={{ marginTop: Spacing.Medium }}>
            {results.length === 0 && searchQuery.trim() ? (
                <p style={{
                fontFamily: FontFamily.Nunito,
                fontSize: FontSize.Large,
                color: Color.Muted,
                marginTop: Spacing.Small,
                }}>
                No users found.
                </p>
            ) : (
                results.map(user => (
                <UserCard key={user.activityPubId} user={user} />
                ))
            )}
            </section>
        </>
        )}
      </main>
    </Layout>
  );
};

export default DiscoverPage;