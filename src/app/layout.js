import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './components/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'HelpShare',
  icons: {
    icon: '/helpshare.svg',
  },
};

import Navbar from './components/Navbar';
import GlobalLoadingBar from './components/GlobalLoadingBar';
import Footer from './components/Footer';
import ThreeCanvasWrapper from './components/ThreeCanvasWrapper';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="antialiased relative">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <GlobalLoadingBar />
            <Navbar />
            <ThreeCanvasWrapper /> {/* Place first to ensure it's behind everything */}
            <div className='my-25'/>
              {children}
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
