import './globals.css';
import { Geist, Geist_Mono } from 'next/font/google';
import {
  ClerkProvider,
} from '@clerk/nextjs';
import { ThemeProvider } from './components/theme-provider';
import { ToastContainer, toast } from 'react-toastify';

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
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        <body className="antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <GlobalLoadingBar />
            <Navbar />
            {children}
            {/* <ToastContainer
              position="top-right"              // top-left | top-right | top-center | bottom-left | bottom-right | bottom-center
              autoClose={3000}                  // Time in ms before auto dismissing toast
              hideProgressBar={false}          // Set true to hide the progress bar
              newestOnTop={false}              // Newest toast appears on top
              closeOnClick                     // Close toast on click
              rtl={false}                      // For right-to-left languages
              pauseOnFocusLoss                 // Pause toast timer when window loses focus
              draggable                        // Allow dragging to dismiss
              pauseOnHover                     // Pause timer on hover
              theme="light"                    // light | dark | colored
              limit={3}                        // Max number of toasts to show at once
            /> */}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
