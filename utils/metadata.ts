// utils/metadata.ts

export interface Metadata {
  title: string;
  description: string;
  favicon: string;
  url: string;
  image: string;
  type: string;
  siteName: string;
}

// General metadata generation function
export function generateMetadata(): Metadata {
  return {
    title: 'MindPlexa - Unleash Your Creativity',
    description:
      'MindPlexa brings collaborative project management to the next level with AI-driven insights.',
    favicon: '/favicon.ico',
    url: 'https://www.mindplexa.com',
    image: '/og-image.png',
    type: 'website',
    siteName: 'MindPlexa Platform'
  };
}
