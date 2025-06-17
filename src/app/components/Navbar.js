'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ModeToggle } from './mode-toggle';

const navLinks = [
  { name: 'Requests', href: '/' },
  { name: 'Payments', href: '/paymentsection' },
  { name: 'Dashboard', href: '/dashboard' },
];
import Lottie from 'lottie-react';
import { useState, useEffect, useRef } from 'react';
import { useCreateUserOnLogin } from './createuserlogin';
export default function Navbar() {
  useCreateUserOnLogin();
  const [animationData, setAnimationData] = useState(null);
  const lottieRef = useRef();

  useEffect(() => {
    fetch('/help.json')
      .then((res) => res.json())
      .then(setAnimationData);
  }, []);
  return (
    <header className="backdrop-blur-xs sticky top-0 z-50 w-full border-b bg-background/95 supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-20 items-center justify-between max-w-screen-xl mx-auto">
        {/* Logo */}
        <div className='flex items-center gap-10'>
          <div className='flex items-center'>
            {animationData && (
              <Lottie
                className="w-12 h-12 md:w-25 md:h-30"
                animationData={animationData}
                loop={true}
                lottieRef={lottieRef}
              />
            )}
            <Link href="/" className="text-3xl font-bold tracking-tight">
              HelpShare
            </Link>
          </div>
          <p>|</p>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        {/* Right: Theme toggle + User */}
        <div className="flex items-center gap-2">
          <ModeToggle />

          {/* Desktop auth buttons */}
          <div className="hidden md:block">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[260px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle className="text-center text-lg font-semibold">
                    Menu
                  </SheetTitle>
                </SheetHeader>

                <nav className="mt-6 flex flex-col gap-4 text-center">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-base text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-6 text-center">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="outline" className="w-full max-w-xs mx-auto">
                        Sign In
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/"/>
                  </SignedIn>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
