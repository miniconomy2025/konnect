'use client';

import PublicProfileView from '@/components/Discover/PublicProfile';
import { UserCard } from '@/components/Discover/UserCard';
import { Header } from '@/components/Home/Header';
import { useToastHelpers } from '@/contexts/ToastContext';
import Layout from '@/layouts/Main';
import { ApiService } from '@/lib/api';
import { Color, FontFamily, FontSize, Spacing, Gradient, BorderWidth, Radius } from '@/lib/presentation';
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
                    position: 'sticky',
                    top: '4rem', // Header height
                    zIndex: 100,
                    background: Color.Background,
                    paddingTop: Spacing.Medium,
                    paddingBottom: Spacing.Small,
                }}
            >
                <section
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: Spacing.XSmall,
                    background: Color.Surface,
                    border: `${BorderWidth.Thin} solid ${Color.Border}`,
                    borderRadius: Radius.Medium,
                    padding: Spacing.Small,
                    margin: `0 ${Spacing.Medium}`,
                    boxShadow: '0 0.125rem 0.5rem rgba(0,0,0,0.05)',
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
                    fontFamily: FontFamily.VarelaRound,
                    fontSize: FontSize.Large,
                    background: 'transparent',
                    color: Color.Text,
                    marginLeft: Spacing.Small,
                    }}
                />
                </section>
                
                <section
                    style={{
                        height: '0.125rem',
                        background: Gradient.Brand,
                        margin: `${Spacing.Medium} ${Spacing.Medium} 0 ${Spacing.Medium}`,
                        borderRadius: '0.1625rem',
                    }}
                />
            </section>

            <section 
                style={{ 
                    paddingTop: Spacing.Small,
                    background: Color.Background,
                }}
            >
            {results.length === 0 && searchQuery.trim() ? (
                <p style={{
                fontFamily: FontFamily.VarelaRound,
                fontSize: FontSize.Large,
                color: Color.Muted,
                marginTop: Spacing.Medium,
                textAlign: 'center',
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
    </Layout>
  );
};

export default DiscoverPage;