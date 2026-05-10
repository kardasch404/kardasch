'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b-4 border-t-4 border-black bg-transparent pb-4 pt-4">
      <div className="border-b-2 border-t-2 border-black pb-2 pt-2">
        <h1 className="font-OldLondon text-center text-8xl font-bold text-themeOrange">
          THE DAILY PORTFOLIO
        </h1>
        <p className="font-TimesNewRoman text-center text-sm font-medium">
          Est. 2024 • Your Source for Professional Excellence
        </p>
      </div>

      <div className="mt-4 flex items-center justify-center gap-8 font-TimesNewRoman text-lg font-bold">
        <Link
          href="/"
          className={`transition-colors hover:text-themeOrange ${
            pathname === '/' ? 'text-themeOrange underline' : 'text-black'
          }`}
        >
          HOME
        </Link>
        <Link
          href="/projects"
          className={`transition-colors hover:text-themeOrange ${
            pathname === '/projects' ? 'text-themeOrange underline' : 'text-black'
          }`}
        >
          PROJECTS
        </Link>
        <Link
          href="/about"
          className={`transition-colors hover:text-themeOrange ${
            pathname === '/about' ? 'text-themeOrange underline' : 'text-black'
          }`}
        >
          ABOUT
        </Link>
        <Link
          href="/contact"
          className={`transition-colors hover:text-themeOrange ${
            pathname === '/contact' ? 'text-themeOrange underline' : 'text-black'
          }`}
        >
          CONTACT
        </Link>
      </div>
    </nav>
  );
}
