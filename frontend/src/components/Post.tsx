import React from 'react';
import type { Post } from '@/types/post';
import { Color, Spacing, FontSize, Radius } from '@/lib/presentation';

interface PostProps {
  post: Post;
  children: React.ReactNode;
}

export function Post({ post, children }: PostProps) {
  return (
    <article
      style={{
        border: `1px solid ${Color.Border}`,
        borderRadius: Radius.Medium,
        background: Color.Surface,
        marginBottom: Spacing.Large,
        overflow: 'hidden',
        maxWidth: 480,
      }}>
      <header style={{
        background: Color.Surface,
        padding: `${Spacing.Medium} ${Spacing.Large}`,
        borderBottom: `1px solid ${Color.Border}`,
        display: 'flex',
        alignItems: 'center',
      }}>
        <strong style={{ color: Color.Text, fontSize: FontSize.Base }}>{post.author.username}</strong>
      </header>
      <section style={{ background: Color.Background, padding: 0, textAlign: 'center' }}>
        {children}
      </section>
      {post.caption && (
        <footer style={{
          padding: `${Spacing.Medium} ${Spacing.Large}`,
          background: Color.Surface,
          borderTop: `1px solid ${Color.Border}`,
        }}>
          <p style={{ margin: 0 }}>{post.caption}</p>
        </footer>
      )}
    </article>
  );
}