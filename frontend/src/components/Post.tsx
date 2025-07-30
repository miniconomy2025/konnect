import React from 'react';
import type { Post } from '@/types/post';

interface PostProps {
  post: Post;
  children: React.ReactNode;
}

export function Post({ post, children }: PostProps) {
  return (
    <article
      style={{ border: '1px solid #eee', borderRadius: '8px', background: '#fff', marginBottom: '2rem', overflow: 'hidden', maxWidth: 480 }}>
      <header style={{ background: '#fff', padding: '0.75rem 1rem', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
        <strong style={{ color: '#222', fontSize: '1rem' }}>{post.author.username}</strong>
      </header>
      <section style={{ background: '#fafafa', padding: 0, textAlign: 'center' }}>
        {children}
      </section>
      {post.caption && (
        <footer style={{ padding: '0.75rem 1rem', background: '#fff', borderTop: '1px solid #eee' }}>
          <p style={{ margin: 0 }}>{post.caption}</p>
        </footer>
      )}
    </article>
  );
}