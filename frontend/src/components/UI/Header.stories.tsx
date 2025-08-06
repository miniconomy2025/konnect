import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header, BrandingHeader, BackHeader, SettingsHeader } from './Header';
import { ArrowLeft, Settings, Search, MoreHorizontal } from 'lucide-react';

const meta: Meta<typeof Header> = {
  title: 'UI/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Header title text',
    },
    showBranding: {
      control: 'boolean',
      description: 'Show Konnect branding instead of title',
    },
    transparent: {
      control: 'boolean',
      description: 'Make header transparent with blur effect',
    },
    showBorder: {
      control: 'boolean',
      description: 'Show bottom border',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Header>;

// Basic Header Examples
export const Default: Story = {
  args: {
    title: 'Page Title',
  },
};

export const WithBranding: Story = {
  args: {
    showBranding: true,
  },
};

export const Transparent: Story = {
  args: {
    title: 'Transparent Header',
    transparent: true,
  },
};

export const NoBorder: Story = {
  args: {
    title: 'No Border',
    showBorder: false,
  },
};

// Headers with Actions
export const WithBackButton: Story = {
  args: {
    title: 'Profile',
    leftAction: {
      icon: <ArrowLeft size={20} />,
      onClick: () => console.log('Back clicked'),
      label: 'Go back',
    },
  },
};

export const WithSettings: Story = {
  args: {
    title: 'Settings',
    rightAction: {
      icon: <Settings size={20} />,
      onClick: () => console.log('Settings clicked'),
      label: 'Open settings',
    },
  },
};

export const WithMultipleActions: Story = {
  args: {
    title: 'Messages',
    leftAction: {
      icon: <ArrowLeft size={20} />,
      onClick: () => console.log('Back clicked'),
      label: 'Go back',
    },
    rightActions: [
      {
        icon: <Search size={20} />,
        onClick: () => console.log('Search clicked'),
        label: 'Search messages',
      },
      {
        icon: <MoreHorizontal size={20} />,
        onClick: () => console.log('More clicked'),
        label: 'More options',
      },
    ],
  },
};

// Convenience Components
export const BrandingExample: Story = {
  render: () => <BrandingHeader />,
};

export const BackHeaderExample: Story = {
  render: () => (
    <BackHeader
      title="User Profile"
      onBack={() => console.log('Back to previous page')}
      backLabel="Back to discover"
    />
  ),
};

export const SettingsHeaderExample: Story = {
  render: () => (
    <SettingsHeader
      title="@username"
      onSettings={() => console.log('Open user settings')}
    />
  ),
};

// Real-world Examples
export const HomeHeader: Story = {
  render: () => <BrandingHeader transparent />,
  parameters: {
    docs: {
      description: {
        story: 'Header used on the Home page with transparent background',
      },
    },
  },
};

export const CreatePostHeader: Story = {
  render: () => (
    <Header
      title="Create Post"
      leftAction={{
        icon: <ArrowLeft size={20} />,
        onClick: () => console.log('Cancel post'),
        label: 'Cancel post creation',
      }}
      rightAction={{
        icon: (
          <button
            style={{
              background: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Post
          </button>
        ),
        onClick: () => {},
        label: 'Submit post',
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Header used on the Create Post page with custom submit button',
      },
    },
  },
};

export const AccountHeader: Story = {
  render: () => (
    <SettingsHeader
      title="@johndoe"
      onSettings={() => console.log('Open account settings')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Header used on the Account page showing username and settings',
      },
    },
  },
};