import type { Meta, StoryObj } from '@storybook/react-vite';
import { Post } from './Post';
import { TextPost } from './TextPost';
import { ImagePost } from './ImagePost';
import { VideoPost } from './VideoPost';

const examplePost = {
  id: '1',
  type: 'local',
  author: {
    id: 'u1',
    username: 'alice',
    displayName: 'Alice Johnson',
    avatarUrl: '/assets/images/missingAvatar.jpg',
    domain: 'konnect.social',
    isLocal: true,
  },
  content: {
    text: 'A sample caption',
    hasMedia: true,
    mediaType: 'image',
  },
  media: {
    type: 'image',
    url: '/assets/images/placeholder.webp',
  },
  engagement: {
    likesCount: 10,
    isLiked: false,
    canInteract: true,
  },
  createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  url: '',
  isReply: false,
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
    content: {
      text: 'Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.',
      hasMedia: false,
      mediaType: 'none',
    },
    media: {
      type: 'text',
      url: '',
    },
  }} />,
};

export const Image: Story = {
  render: () => <ImagePost post={{
    ...examplePost,
    author: {
      ...examplePost.author,
      username: 'jane',
      displayName: 'Jane Smith',
      domain: 'mastodon.social',
      isLocal: false,
    },
    content: {
      text: 'Amazing sunset at the beach today! 🌅',
      hasMedia: true,
      mediaType: 'image',
    },
    media: {
      type: 'image',
      url: '/assets/images/placeholder.webp',
    },
    engagement: {
      likesCount: 156,
      isLiked: true,
      canInteract: true,
    },
  }} />,
};

export const Video: Story = {
  render: () => <VideoPost post={{
    ...examplePost,
    author: {
      ...examplePost.author,
      username: 'creator',
      displayName: 'Video Creator',
      domain: 'pixelfed.social',
      isLocal: false,
    },
    content: {
      text: 'Check out this cool trick! 🎯',
      hasMedia: true,
      mediaType: 'video',
    },
    media: {
      type: 'video',
      url: '/sample.mp4',
    },
    engagement: {
      likesCount: 89,
      isLiked: false,
      canInteract: true,
    },
  }} />,
};

export const LongText: Story = {
  render: () => <TextPost post={{
    ...examplePost,
    author: {
      ...examplePost.author,
      username: 'philosopher',
      displayName: 'Deep Thinker',
      domain: 'lemmy.world',
      isLocal: false,
    },
    content: {
      text: 'Sometimes you just need to take a moment and appreciate the little things in life. Today I found this beautiful flower growing in the most unexpected place. It reminded me that beauty can be found anywhere if you look hard enough. 🌸\n\nLife has a way of surprising us when we least expect it. Whether it\'s a kind word from a stranger, a perfect cup of coffee, or a moment of clarity in the midst of chaos, these small moments make all the difference.',
      hasMedia: false,
      mediaType: 'none',
    },
    media: {
      type: 'text',
      url: '',
    },
    engagement: {
      likesCount: 42,
      isLiked: false,
      canInteract: true,
    },
  }} />,
};

export const PopularPost: Story = {
  render: () => <ImagePost post={{
    ...examplePost,
    author: {
      ...examplePost.author,
      username: 'photographer',
      displayName: 'Amazing Photographer',
      domain: 'federated-photos-community.example.com',
      isLocal: false,
    },
    content: {
      text: 'Perfect timing! 📸',
      hasMedia: true,
      mediaType: 'image',
    },
    media: {
      type: 'image',
      url: '/assets/images/placeholder.webp',
    },
    engagement: {
      likesCount: 1203,
      isLiked: true,
      canInteract: true,
    },
  }} />,
};