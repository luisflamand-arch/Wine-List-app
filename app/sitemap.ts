import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function sitemap(): MetadataRoute.Sitemap {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') ?? 'localhost:3000';
  const protocol = host?.includes?.('localhost') ? 'http' : 'https';
  const siteUrl = `${protocol}://${host}`;

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  ];
}
