'use client';

import {
  AddPostHeader,
  CaptionInput,
  ErrorMessage,
  MediaPreview,
  MediaUpload,
} from '@/components/AddPost';
import { useToastHelpers } from '@/contexts/ToastContext';
import Layout from '@/layouts/Main';
import { ApiService } from '@/lib/api';
import { Layout as SharedLayout } from '@/lib/sharedStyles';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const AddPost: React.FC = () => {
  const router = useRouter();
  const [caption, setContent] = useState('');
  const [imageFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const { success, error: showError } = useToastHelpers();
  
  const validMediaTypes = process.env.NEXT_PUBLIC_VALID_MEDIA_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_CHARACTERS = Number(process.env.NEXT_PUBLIC_MAX_CHARACTERS) || 2200;
  const maxSizeMB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 10;

  useEffect(() => {
    if (!localStorage.getItem('auth_token')) {
      showError('Please login first to create a post!', {
        action: {
          label: 'Go to Login',
          onClick: () => router.push('/Login')
        }
      });
      router.push('/Login');
      return;
    }
  }, [router, showError]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= MAX_CHARACTERS) {
      setContent(newContent);
      setCharCount(newContent.length);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!validMediaTypes.includes(file.type)) {
        setError(`Please select a valid image (${validMediaTypes.map(type => type.split('/')[1]).join(', ')}) file.`);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File size must be less than ${maxSizeMB}MB.`);
        return;
      }

      setMediaFile(file);
      setError(null);

      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      setError('Caption is required.');
      return;
    }

    if (!imageFile) {
      setError('Image is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('caption', caption.trim());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await ApiService.createPost(formData);
      
      if (response.error) {
        setError(response.error);
        showError('Failed to create post. Please try again.');
      } else {
        // Success - redirect to home
        success('Post created successfully!');
        router.push('/');
      }
    } catch {
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  const canSubmit = caption.trim().length > 0 && imageFile !== null;

  return (
    <Layout>
      <main style={SharedLayout.mainContainer}>
        <AddPostHeader
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />

        <ErrorMessage error={error} />

        <form style={SharedLayout.centeredContainer}>
          <CaptionInput
            caption={caption}
            charCount={charCount}
            maxCharacters={MAX_CHARACTERS}
            onChange={handleContentChange}
          />

          <MediaPreview
            mediaPreview={mediaPreview}
            imageFile={imageFile}
            onRemove={removeMedia}
          />

          <MediaUpload
            imageFile={imageFile}
            validMediaTypes={validMediaTypes}
            maxSizeMB={maxSizeMB}
            onFileSelect={handleFileSelect}
          />
        </form>
      </main>
    </Layout>
  );
};

export default AddPost; 