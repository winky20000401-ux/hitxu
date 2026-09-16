import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

const siteUrl = 'https://www.gitxu.com';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gitxu.com'),
  title: 'GitGame - Free Online Mini Games, Game News & Guides',
  description: 'Play instant browser mini games, master in-depth game guides, and catch up on daily gaming news — all free, no downloads.',
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website', locale: 'en_US', url: siteUrl, siteName: 'GitGame',
    title: 'GitGame - Free Online Mini Games, Game News & Guides',
    description: 'Play instant browser mini games, master in-depth game guides, and catch up on daily gaming news — all free, no downloads.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'GitGame — games, guides and gaming news' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitGame - Free Online Mini Games, Game News & Guides',
    description: 'Play browser mini games and explore the latest gaming news and guides.',
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
  verification: {
    google: 'mAZa1C0e2yFVWLtSm7tB4O-ZwCdfdBWx4oraCov1d-0',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="mAZa1C0e2yFVWLtSm7tB4O-ZwCdfdBWx4oraCov1d-0" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              { '@type': 'WebSite', name: 'GitGame', url: siteUrl, description: 'Free browser mini games, gaming news and in-depth game guides.' },
              { '@type': 'Organization', name: 'GitGame', url: siteUrl, logo: `${siteUrl}/opengraph-image` },
            ],
          }).replace(/</g, '\\u003c'),
        }} />
      </head>
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
