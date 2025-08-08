    "use client";

    import AccountHeader from '@/components/account/Header';
import Modal from '@/components/account/Modal';
import PostModal from '@/components/account/PostModal';
import PostsGrid from '@/components/account/PostsGrid';
import ProfileSection from '@/components/account/ProfileSection';
import SettingsModal from '@/components/account/SettingsModal';
import UserListItem from '@/components/account/UserListItem';
import { Header } from '@/components/Home/Header';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { useToastHelpers } from '@/contexts/ToastContext';
import Layout from '@/layouts/Main';
import { ApiService } from '@/lib/api';
import { getSessionCache, setSessionCache } from '@/lib/sessionCache';
import { styles } from '@/styles/account';
import { Actor, UserProfile } from '@/types/account';
import { Post, PostsResponse } from '@/types/post';
import React, { useEffect, useState } from 'react';

    const ProfilePage: React.FC = () => {
    // const [activeTab] = useState<string>('posts'); // TODO: Implement tab functionality
    const [showFollowers, setShowFollowers] = useState<boolean>(false);
    const [showFollowing, setShowFollowing] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [isEditingName, setIsEditingName] = useState<boolean>(false);
    const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
    const [isLoadingBio, setIsLoadingBio] = useState<boolean>(false);
    const [isLoadingName, setIsLoadingName] = useState<boolean>(false);
    const [displayName, setDisplayName] = useState<string>('');
    const [userName, setUserName] = useState<string>('');

    const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
    const [followers, setFollowers] = useState<Actor[]>([]);
    const [following, setFollowing] = useState<Actor[]>([]);
    const [posts, setPosts] = useState<PostsResponse | undefined>(undefined);
        const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const [tempName, setTempName] = useState<string>(userName);
    const [bio, setBio] = useState<string>('');
    const [tempBio, setTempBio] = useState<string>(bio);
    const { success: showSuccess, error: showError } = useToastHelpers();


        useEffect(() => {
            if(!sessionStorage.getItem('auth_token')){
                showError('Please login first to access your profile!', {
                    action: {
                        label: 'Go to Login',
                        onClick: () => window.location.href = '/Login'
                    }
                });
                window.location.href = '/Login';
                return;
            }

            // 1) Try to hydrate from session cache immediately
            const cachedUser = getSessionCache<UserProfile>('meProfile', 24 * 60 * 60 * 1000);
            if (cachedUser) {
                setUserProfile(cachedUser);
                setDisplayName(cachedUser.displayName);
                setUserName(cachedUser.username);
                setTempName(cachedUser.displayName);
                setBio(cachedUser.bio);
                setTempBio(cachedUser.bio);
                // Fire posts and followers in parallel based on cached identity
                ApiService.getUserPosts(cachedUser.username).then(({ data }) => {
                    if (data) setPosts(data);
                });
                ApiService.getFollowers(cachedUser.username).then(({ data }) => {
                    if (data) {
                        const userFollowers = data.followers || [];
                        const userFollowing = data.following || [];
                        const followers: Actor[] = userFollowers.map(user => user.actor);
                        const following: Actor[] = userFollowing.map(user => user.object);
                        setFollowing(following);
                        setFollowers(followers);
                    }
                });
            }

            // 2) Always refresh /me in background and cache it
            const refreshMe = async () => {
                const { data, error } = await ApiService.getCurrentUser();
                if (error || !data) {
                    console.error('Failed to fetch user data:', error);
                    return;
                }
                // Update state and cache
                setUserProfile(data);
                setDisplayName(data.displayName);
                setUserName(data.username);
                setTempName(data.displayName);
                setBio(data.bio);
                setTempBio(data.bio);
                setSessionCache('meProfile', data);

                // If we didn't have cache, or username changed, fetch posts/followers now
                if (!cachedUser || cachedUser.username !== data.username) {
                    const postsPromise = ApiService.getUserPosts(data.username);
                    const followsPromise = ApiService.getFollowers(data.username);
                    postsPromise.then(({ data }) => { if (data) setPosts(data); });
                    followsPromise.then(({ data }) => {
                        if (data) {
                            const userFollowers = data.followers || [];
                            const userFollowing = data.following || [];
                            const followers: Actor[] = userFollowers.map(user => user.actor);
                            const following: Actor[] = userFollowing.map(user => user.object);
                            setFollowing(following);
                            setFollowers(followers);
                        }
                    });
                }
            };

            refreshMe();
        }, []);

    // Event handlers
    const handleNameCancel = (): void => {
        setTempName(displayName);
        setIsEditingName(false);
    };

    const handleNameSave = async () => {
        if (!userProfile) return;

        setIsLoadingName(true);
        try {
            const response = await ApiService.updateDisplayName(tempName);

            if(response.error){
                showError('Error updating display name');
            }else{
                showSuccess('Updated Display Name');
                setDisplayName(tempName);
                setUserProfile({ ...userProfile, displayName: tempName });
                setIsEditingName(false);        
            }
        } catch (error) {
            showError('Error updating display name');
        } finally {
            setIsLoadingName(false);
        }
    };

    const handleBioSave = async () => {
        if (!userProfile) return;

        setIsLoadingBio(true);
        try {
            const response = await ApiService.updateBio(tempBio);

            if(response.error){
                showError('Error updating bio');
            }else{
                showSuccess('Updated Bio');
                setBio(tempBio);
                setUserProfile({ ...userProfile, bio: tempBio });
                setIsEditingBio(false);
            }
        } finally {
            setIsLoadingBio(false);
        }
    };

    const handleBioCancel = (): void => {
        setTempBio(bio);
        setIsEditingBio(false);
    };

    if (!userProfile) return (
        <Layout>
            <section style={{ padding: '1rem', maxWidth: '960px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <Skeleton width={160} height={24} />
                    <Skeleton width={32} height={32} circle />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <Skeleton width={80} height={80} circle />
                    <div style={{ flex: 1 }}>
                        <Skeleton width={'40%'} height={20} />
                        <Skeleton width={'30%'} height={16} style={{ marginTop: 8 }} />
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 12 }}>
                            <Skeleton width={80} height={28} />
                            <Skeleton width={100} height={28} />
                        </div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} width={'100%'} height={160} />
                    ))}
                </div>
            </section>
        </Layout>
    );

    return (
        <Layout>
            <section style={styles.container}>
            <Header 
                editProfile={true}
                onSettingsClick={() => setShowSettings(true)}   
            />
            {userProfile ? (
                <ProfileSection 
                    userProfile={userProfile}
                    isEditingBio={isEditingBio}
                    tempBio={tempBio}
                    setTempBio={setTempBio}
                    onEditBio={() => setIsEditingBio(true)}
                    onSaveBio={handleBioSave}
                    onCancelBio={handleBioCancel}
                    onFollowersClick={() => setShowFollowers(true)}
                    onFollowingClick={() => setShowFollowing(true)}
                    isLoadingBio={isLoadingBio}
                />
            ) : (
                <section style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <Skeleton width={80} height={80} circle />
                        <div style={{ flex: 1 }}>
                            <Skeleton width={'40%'} height={20} />
                            <Skeleton width={'30%'} height={16} style={{ marginTop: 8 }} />
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 12 }}>
                                <Skeleton width={80} height={28} />
                                <Skeleton width={100} height={28} />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {!posts ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} width={'100%'} height={160} />
                    ))}
                </div>
            ) : (
                <PostsGrid 
                    posts={posts.posts}
                    onPostClick={(post) => setSelectedPost(post)}
                />
            )}

            {/* Modals */}
            <Modal 
                isOpen={showFollowers} 
                onClose={() => setShowFollowers(false)}
                title="Followers"
            >
                {followers.map((user) => (
                <UserListItem key={user._id} user={user} following />
                ))}
            </Modal>

            <Modal 
                isOpen={showFollowing} 
                onClose={() => setShowFollowing(false)}
                title="Following"
            >
                {following.map((user) => (
                <UserListItem key={user._id} user={user} />
                ))}
            </Modal>

            <Modal 
                isOpen={showSettings} 
                onClose={() => setShowSettings(false)}
                title="Settings"
            >
                <SettingsModal 
                    displayName={displayName}
                    isEditingName={isEditingName}
                    tempName={tempName}
                    setTempName={setTempName}
                    onEditName={() => setIsEditingName(true)}
                    onSaveName={handleNameSave}
                    onCancelName={handleNameCancel}
                    isLoadingName={isLoadingName}
                />
            </Modal>
            {selectedPost && (
            <PostModal
                post={selectedPost}
                onClose={() => setSelectedPost(null)}
                onPostDeleted={(id) => {
                setPosts((prev) => ({
                    ...prev!,
                    posts: prev!.posts.filter((post) => post.id !== id),
                }));
                }}
                onPostUpdated={(updatedPost) => {
                    setPosts((prev) => ({
                        ...prev!,
                        posts: prev!.posts.map((post) => post.id === updatedPost.id ? updatedPost : post),
                    })
                );
                setSelectedPost(updatedPost);
                }}
            />
            )}
            </section>
        </Layout>
    );
    };

    export default ProfilePage;