import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'GitGame - Discover Great Games, News & Mini Games',
  description: 'Instant play online H5 mini games and latest game guides and news.',
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
      </head>
      <body className="bg-slate-950 text-slate-100 flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
