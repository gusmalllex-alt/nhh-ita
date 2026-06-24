'use client';

import React from 'react';
import Image from 'next/image';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass-nav sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">

        {/* Logo Section */}
        <div className="flex items-center gap-3 md:gap-4 cursor-pointer group">
          <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all duration-300 border border-white/15 shrink-0">
            <Image
              src="https://img1.pic.in.th/images/nhh.png"
              alt="โลโก้โรงพยาบาลหนองหาน"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md"
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-semibold leading-tight tracking-wide drop-shadow-md" style={{ color: 'var(--nav-text)' }}>
              MOPH Open Data Integrity and Transparency Assessment
            </h1>
            <span className="font-medium text-[10px] sm:text-xs md:text-sm block mt-0.5 drop-shadow-md" style={{ color: 'var(--nav-sub)' }}>
              โรงพยาบาลหนองหาน จังหวัดอุดรธานี
            </span>
          </div>
        </div>

        {/* Right: Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="theme-toggle shrink-0"
          title={theme === 'light' ? 'เปลี่ยนเป็นโหมดมืด' : 'เปลี่ยนเป็นโหมดสว่าง'}
          aria-label="Toggle theme"
        >
          {theme === 'light'
            ? <Moon size={16} strokeWidth={1.8} />
            : <Sun  size={16} strokeWidth={1.8} />
          }
        </button>

      </div>
    </nav>
  );
}
