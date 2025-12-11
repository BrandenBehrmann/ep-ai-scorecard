'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="py-12 px-6 bg-white dark:bg-black border-t border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {mounted && (
              <Image
                src={resolvedTheme === 'dark' ? '/assets/logo-white.svg' : '/assets/logo-black.svg'}
                alt="Pragma Score"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
            )}
            <div className="flex flex-col">
              <span className="text-gray-900 dark:text-white font-semibold">
                Pragma Score
              </span>
              <span className="text-gray-500 dark:text-white/50 text-xs">
                by Ena Pragma
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://enapragma.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Ena Pragma
            </a>
            <Link
              href="/assessment/start"
              className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Start Assessment
            </Link>
            <Link
              href="/assessment/demo"
              className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Demo
            </Link>
            <a
              href="mailto:hello@enapragma.co"
              className="text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Contact
            </a>
            <Link
              href="/admin/assessments"
              className="text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-gray-500 dark:text-white/50 text-sm">
            &copy; {new Date().getFullYear()} Ena Pragma. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
