"use client";

import { useEffect, useState } from 'react';
import { Post } from '@/types/post';
import { styles } from '@/styles/account';
import { ApiService } from '@/lib/api';
import { Edit2, Check, X } from 'lucide-react';

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

    useEffect(() => {
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

  const handleCaptionSave = async () => {
    const { data, error } = await ApiService.updatePostCaption(post.id, caption);

    if (error) return alert('Failed to update caption');

    onPostUpdated({ ...post, content: { ...post.content, text: caption } });
    setEditing(false);
  };

  const handleDelete = async () => {
    // const confirm = window.confirm('Are you sure you want to delete this post?');
    // if (!confirm) return;

    // setLoading(true);
    // const { error } = await ApiService.deletePost(post._id);
    // setLoading(false);
    // if (error) return alert('Failed to delete post');
    // onPostDeleted(post._id);
    // onClose();
    console.log('delete')
  };

  return (
    <section style={styles.modal}>
      <section style={{ ...styles.modalContent, 
        maxWidth: '45vw',
        maxHeight: '70vh',
        overflowY: 'auto',
        borderRadius: '12px',
        padding: '1rem',
      }}>
        <section style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>Your Post</h3>
          <button style={styles.cancelButton} onClick={onClose}>Close</button>
        </section>
        <section style={{ padding: '1rem' }}>
          {post.media.type === 'text' ? (
            <p>{caption}</p>
          ) : (
            <section style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <img
                src={post.media.url}
                alt="Post"
                style={{
                maxWidth: '100%',
                maxHeight: '40vh',
                height: 'auto',
                width: 'auto',
                borderRadius: '8px',
                objectFit: 'contain',
                }}
            />
            </section>
          )}

          {editing ? (
            <>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{...styles.bioTextarea, marginTop: '2rem'}}
              />
              <section style={{ marginTop: '0.5rem' }}>
                <button style={styles.saveButton} onClick={handleCaptionSave} disabled={loading}>Save</button>
                <button style={styles.cancelButton} onClick={() => setEditing(false)}>Cancel</button>
              </section>
            </>
          ) : (
            <>
              <p style={{ marginTop: '1rem' }}>{caption}</p>
              <section style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button style={styles.editButton} onClick={() => setEditing(true)}>Edit Caption</button>
                <button style={styles.cancelButton} onClick={handleDelete} disabled={loading}>Delete</button>
              </section>
            </>
          )}
        </section>
      </section>
    </section>
  );
};

export default PostModal;
