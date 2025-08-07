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

export const WithoutAvatar: Story = {
  render: () => <TextPost post={{
    ...examplePost,
    author: {
      ...examplePost.author,
      avatarUrl: '', // No avatar to test character display
      displayName: 'Bob Smith',
      username: 'bob_smith',
    },
    content: {
      text: 'Testing the new character-based avatar display! This should show "B" as my profile picture.',
      hasMedia: false,
      mediaType: 'none',
    },
    media: {
      type: 'text',
      url: '',
    },
    engagement: {
      likesCount: 15,
      isLiked: false,
      canInteract: true,
    },
  }} />,
};

export const MultipleColoredAvatars: Story = {
  render: () => (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 500 }}>
      <TextPost post={{
        ...examplePost,
        id: '1',
        author: {
          ...examplePost.author,
          avatarUrl: '', 
          displayName: 'Alice Johnson',
          username: 'alice_j',
        },
        content: {
          text: 'Alice here! My avatar should be a consistent color based on my username.',
          hasMedia: false,
          mediaType: 'none',
        },
        media: { type: 'text', url: '' },
      }} />
      <TextPost post={{
        ...examplePost,
        id: '2',
        author: {
          ...examplePost.author,
          avatarUrl: '', 
          displayName: 'Charlie Brown',
          username: 'charlie_b',
        },
        content: {
          text: 'Charlie here! My avatar color should be different from Alice but consistent for me.',
          hasMedia: false,
          mediaType: 'none',
        },
        media: { type: 'text', url: '' },
      }} />
      <TextPost post={{
        ...examplePost,
        id: '3',
        author: {
          ...examplePost.author,
          avatarUrl: '', 
          displayName: 'Dana Wilson',
          username: 'dana_w',
        },
        content: {
          text: 'Dana here! Each username gets its own unique color based on a hash function.',
          hasMedia: false,
          mediaType: 'none',
        },
        media: { type: 'text', url: '' },
      }} />
    </section>
  ),
};