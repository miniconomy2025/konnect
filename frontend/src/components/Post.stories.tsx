import type { Meta, StoryObj } from '@storybook/react';
import { Post } from './Post';
import { TextPost } from './TextPost';
import { ImagePost } from './ImagePost';
import { VideoPost } from './VideoPost';

const examplePost = {
  id: '1',
  author: { 
    id: 'u1', 
    username: 'alice', 
    displayName: 'Alice Johnson', 
    avatarUrl: '/assets/images/missingAvatar.jpg' 
  },
  caption: 'A sample caption',
  mediaUrl: '/assets/images/placeholder.webp',
  mediaType: 'image' as const,
  likesCount: 10,
  isLiked: false,
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
};

const meta: Meta<typeof Post> = {
  title: 'Components/Post',
  component: Post,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Post>;

export const Text: Story = {
  render: () => <TextPost post={{
    ...examplePost,
    mediaType: 'text',
    caption: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.'
  }} />,
};

export const Image: Story = {
  render: () => <ImagePost post={{ 
    ...examplePost, 
    mediaType: 'image', 
    mediaUrl: '/assets/images/placeholder.webp',
    caption: 'Amazing sunset at the beach today! 🌅',
    likesCount: 156,
    isLiked: true,
  }} />,
};

export const Video: Story = {
  render: () => <VideoPost post={{ 
    ...examplePost, 
    mediaType: 'video', 
    mediaUrl: '/sample.mp4',
    caption: 'Check out this cool trick! 🎯',
    likesCount: 89,
    isLiked: false,
  }} />,
};

export const LongText: Story = {
  render: () => <TextPost post={{
    ...examplePost,
    mediaType: 'text',
    caption: 'Sometimes you just need to take a moment and appreciate the little things in life. Today I found this beautiful flower growing in the most unexpected place. It reminded me that beauty can be found anywhere if you look hard enough. 🌸\n\nLife has a way of surprising us when we least expect it. Whether it\'s a kind word from a stranger, a perfect cup of coffee, or a moment of clarity in the midst of chaos, these small moments make all the difference.',
    likesCount: 42,
    isLiked: false,
  }} />,
};

export const PopularPost: Story = {
  render: () => <ImagePost post={{ 
    ...examplePost, 
    mediaType: 'image', 
    mediaUrl: '/assets/images/placeholder.webp',
    caption: 'Perfect timing! 📸',
    likesCount: 1203,
    isLiked: true,
  }} />,
};