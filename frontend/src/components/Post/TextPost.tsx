import React from 'react';
import type { Post } from '@/types/post';
import { Post as PostContainer } from './Post';
import { Color, Spacing, FontSize } from '@/lib/presentation';

interface TextPostProps {
  post: Post;
}

export function TextPost({ post }: TextPostProps) {
  return (
    <PostContainer post={post}>
      <section style={{ 
        padding: `${Spacing.Large} ${Spacing.Medium}`, 
        fontSize: FontSize.Base, 
        color: Color.Text, 
        margin: 0,
        textAlign: 'left',
      }}>
        <p style={{ 
          margin: 0, 
          textAlign: 'justify',
          lineHeight: 1.6,
        }}>
          {post.content.text}
        </p>
      </section>
    </PostContainer>
  );
}