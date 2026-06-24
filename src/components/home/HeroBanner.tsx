'use client';

import React from 'react';
import { ImagePlus } from 'lucide-react';
import Image from 'next/image';

interface HeroBannerProps {
  bannerUrl?: string;
  isAdmin?: boolean;
}

export default function HeroBanner({ bannerUrl, isAdmin = false }: HeroBannerProps) {
  // Use default mockup banner if none provided
  const displayUrl = bannerUrl || "https://img1.pic.in.th/images/moph-banner-ita.jpg"; 

  return (
    <div className="w-full relative group border-b border-slate-200 shadow-sm flex justify-center bg-slate-100 overflow-hidden min-h-[120px] md:min-h-[200px]">
      <div className="w-full max-w-[1280px] relative flex flex-col items-center">
        {displayUrl ? (
          <>
            <img 
              src={displayUrl} 
              alt="Banner ITA" 
              className="w-full h-auto object-cover block animate-in fade-in duration-1000"
              onError={(e) => { 
                const target = e.target as HTMLImageElement;
                target.style.display = 'none'; 
              }} 
            />
            
            {isAdmin && (
              <button className="absolute bottom-3 md:bottom-4 right-3 md:right-4 z-20 flex items-center gap-2 text-[10px] md:text-xs bg-black/60 hover:bg-black/90 backdrop-blur-md text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full transition-all border border-white/20 shadow-lg opacity-70 hover:opacity-100 hover:scale-105 active:scale-95">
                <ImagePlus size={14} className="md:w-4 md:h-4" /> 
                <span className="hidden sm:inline">เปลี่ยนแบนเนอร์</span>
              </button>
            )}
          </>
        ) : (
          /* Placeholder UI when absolutely no banner is found */
          <div className="w-full py-16 flex items-center justify-center bg-gradient-to-r from-emerald-50 to-teal-50">
             <div className="text-emerald-800/40 font-bold text-xl flex items-center gap-2">
                NHH ITA PORTAL
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
