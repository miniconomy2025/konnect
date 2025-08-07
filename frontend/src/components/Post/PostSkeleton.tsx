import { Skeleton } from '@/components/Skeleton/Skeleton';
import { Color, Radius, Spacing } from '@/lib/presentation';
import React from 'react';

interface PostSkeletonProps {
  hasMedia?: boolean;
}

export const PostSkeleton: React.FC<PostSkeletonProps> = ({ hasMedia = false }) => {
  return (
    <article
      style={{
        border: `1px solid ${Color.Border}`,
        borderRadius: Radius.Medium,
        background: Color.Surface,
        marginBottom: Spacing.Large,
        overflow: 'hidden',
        maxWidth: 480,
        margin: '0 auto 1.5rem auto',
      }}
    >
      <header style={{
        background: Color.Surface,
        padding: `${Spacing.Medium} ${Spacing.Large}`,
        borderBottom: `1px solid ${Color.Border}`,
        display: 'flex',
        alignItems: 'center',
        gap: Spacing.Small,
      }}>
        <Skeleton width={40} height={40} circle />
        <section style={{ flex: 1 }}>
          <Skeleton width={160} height={14} style={{ marginBottom: 8 }} />
          <Skeleton width={120} height={12} />
        </section>
        <Skeleton width={64} height={20} style={{ borderRadius: 12 }} />
      </header>

      {hasMedia ? (
        <div style={{ background: Color.Background }}>
          <Skeleton width="100%" height={260} borderRadius={0} />
          <div style={{ padding: `${Spacing.Medium} ${Spacing.Large}` }}>
            <Skeleton width="100%" height={12} style={{ marginBottom: 8 }} />
            <Skeleton width="85%" height={12} />
          </div>
        </div>
      ) : (
        <section style={{ padding: `${Spacing.Large} ${Spacing.Medium}`, background: Color.Background }}>
          <Skeleton width="100%" height={12} style={{ marginBottom: 10 }} />
          <Skeleton width="90%" height={12} style={{ marginBottom: 10 }} />
          <Skeleton width="75%" height={12} />
        </section>
      )}

      <footer style={{
        padding: `${Spacing.Medium} ${Spacing.Large}`,
        background: Color.Surface,
        borderTop: `1px solid ${Color.Border}`,
        display: 'flex',
        alignItems: 'center',
        gap: Spacing.Small,
      }}>
        <Skeleton width={20} height={20} circle />
        <Skeleton width={36} height={14} />
      </footer>
    </article>
  );
};

