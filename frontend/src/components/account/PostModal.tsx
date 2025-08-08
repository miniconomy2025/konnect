"use client";

import { useToastHelpers } from '@/contexts/ToastContext';
import { ApiService } from '@/lib/api';
import { styles } from '@/styles/account';
import { Post } from '@/types/post';
import { Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PostModalProps {
  post: Post;
  onClose: () => void;
  onPostDeleted: (postId: string) => void;
  onPostUpdated: (updatedPost: Post) => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose, onPostDeleted, onPostUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.content.text);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSmall, setIsSmall] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useRef(`post-modal-title-${Math.random().toString(36).slice(2)}`).current;
  const { success, error: showError } = useToastHelpers();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setIsVisible(true);
    previouslyFocusedRef.current = document.activeElement as HTMLElement;
    
    const onResize = () => setIsSmall(window.innerWidth < 480);
    onResize();
    window.addEventListener('resize', onResize);
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const root = containerRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'));
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        const active = document.activeElement as HTMLElement;
        if (e.shiftKey) {
          if (active === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    
    // Focus the modal container
    setTimeout(() => {
      containerRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      setIsVisible(false);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [onClose]);

  const handleCaptionSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await ApiService.updatePostCaption(post.id, caption);

      if (error) {
        showError('Failed to update caption. Please try again.');
        return;
      }

      success('Caption updated successfully!');
      onPostUpdated({ ...post, content: { ...post.content, text: caption } });
      setEditing(false);
    } catch (err) {
      showError('Failed to update caption. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setConfirmingDelete(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await ApiService.deletePost(post.id);
      if (error) {
        showError('Failed to delete post. Please try again.');
        return;
      }
      success('Post deleted successfully!');
      onPostDeleted(post.id);
      onClose();
    } finally {
      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const overlayStyle: React.CSSProperties = {
    ...styles.modal,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 150ms ease-out',
    ...(isSmall && {
      alignItems: 'flex-end',
      padding: 0,
    }),
  };

  const contentBase = { ...styles.modalContent } as React.CSSProperties;
  
  if (isSmall) {
    Object.assign(contentBase, {
      width: '100vw',
      height: 'auto',
      maxHeight: '85vh',
      margin: 0,
      borderRadius: '16px 16px 0 0',
      position: 'relative',
    });
  }

  const contentStyle: React.CSSProperties = {
    ...contentBase,
    transform: isVisible 
      ? 'translateY(0)' 
      : isSmall 
        ? 'translateY(100%)' 
        : 'scale(0.98)',
    transition: isSmall 
      ? 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)' 
      : 'transform 150ms ease-out',
    outline: 'none',
  };

  return (
    <section 
      style={overlayStyle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <section ref={containerRef as any} tabIndex={-1} style={contentStyle}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        {isSmall && (
          <div style={{
            width: 32,
            height: 4,
            backgroundColor: '#d1d5db',
            borderRadius: 2,
            margin: '8px auto',
            cursor: 'pointer',
          }} onClick={onClose} />
        )}
        <section style={styles.modalHeader}>
          <h3 id={titleId} style={styles.modalTitle}>Your Post</h3>
          <button onClick={onClose} style={styles.iconButton} aria-label="Close">
            <X size={20} />
          </button>
        </section>
        <section style={styles.modalBody}>
          {post.media?.type === 'text' ? (
            <p>{caption}</p>
          ) : post.media?.url ? (
            <section style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <img
                src={post.media.url}
                alt="Post"
                style={{
                maxWidth: '100%',
                maxHeight: '50vh',
                height: 'auto',
                width: 'auto',
                borderRadius: '8px',
                objectFit: 'contain',
                }}
            />
            </section>
          ) : (
            <p>{caption}</p>
          )}

                     {editing ? (
             <section style={{
               marginTop: '1rem',
               display: 'flex',
               flexDirection: 'column',
               gap: '0.75rem',
             }}>
               <textarea
                 value={caption}
                 onChange={(e) => setCaption(e.target.value)}
                 style={{
                   ...styles.bioTextarea,
                   width: '100%',
                   minHeight: isSmall ? '100px' : '80px',
                 }}
                 disabled={loading}
                 placeholder="Write a caption..."
               />
               <section style={{
                 display: 'flex',
                 gap: '0.5rem',
                 flexDirection: isSmall ? 'column' : 'row',
                 justifyContent: isSmall ? 'stretch' : 'flex-end',
               }}>
                 <button 
                   onClick={handleCaptionSave} 
                   disabled={loading}
                   style={{
                     ...styles.saveButton,
                     backgroundColor: loading ? '#9ca3af' : '#10b981',
                     color: '#fff',
                     border: 'none',
                     borderRadius: 6,
                     padding: isSmall ? '0.75rem 1rem' : '6px 12px',
                     display: 'inline-flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: 4,
                     cursor: loading ? 'not-allowed' : 'pointer',
                     fontSize: '0.875rem',
                     fontWeight: 500,
                     opacity: loading ? 0.7 : 1,
                     flex: isSmall ? 1 : 'none',
                   }}
                 >
                   {loading ? (
                     <>
                       <div style={{
                         width: 14,
                         height: 14,
                         border: '2px solid #fff',
                         borderTop: '2px solid transparent',
                         borderRadius: '50%',
                         animation: 'spin 1s linear infinite',
                       }} />
                       Saving...
                     </>
                   ) : (
                     'Save'
                   )}
                 </button>
                 <button 
                   onClick={() => setEditing(false)} 
                   disabled={loading}
                   style={{
                     ...styles.cancelButton,
                     backgroundColor: '#fee2e2',
                     color: '#dc2626',
                     border: `1px solid #ef4444`,
                     borderRadius: 6,
                     padding: isSmall ? '0.75rem 1rem' : '6px 12px',
                     display: 'inline-flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: 4,
                     cursor: loading ? 'not-allowed' : 'pointer',
                     fontSize: '0.875rem',
                     fontWeight: 500,
                     opacity: loading ? 0.5 : 1,
                     flex: isSmall ? 1 : 'none',
                   }}
                 >
                   Cancel
                 </button>
               </section>
             </section>
           ) : (
            <>
              <p style={{ marginTop: '1rem' }}>{caption}</p>
              <section style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  style={{
                    ...styles.editButton,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }} 
                  onClick={() => setEditing(true)}
                  disabled={loading}
                >
                  Edit Caption
                </button>
                <button 
                  style={{
                    ...styles.cancelButton,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1,
                  }} 
                  onClick={handleDelete} 
                  disabled={loading}
                >
                  Delete
                </button>
              </section>
            </>
          )}

          {confirmingDelete && (
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-delete-title"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setConfirmingDelete(false);
              }}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 300,
                padding: 16,
              }}
            >
              <section
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: '#fff',
                  width: 'min(95vw, 420px)',
                  borderRadius: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <h4 id="confirm-delete-title" style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trash2 size={18} color="#dc2626" /> Delete this post?
                </h4>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                  This action cannot be undone.
                </p>
                <section style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    disabled={isDeleting}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    style={{
                      backgroundColor: isDeleting ? '#9ca3af' : '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 12px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {isDeleting ? (
                      <>
                        <div style={{
                          width: 14,
                          height: 14,
                          border: '2px solid #fff',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }} />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </section>
              </section>
            </section>
          )}
        </section>
      </section>
    </section>
  );
};

export default PostModal;
