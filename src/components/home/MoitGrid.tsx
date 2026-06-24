'use client';

import React from 'react';
import { MOIT_DESCRIPTIONS } from '@/lib/moit-data';

interface Moit {
  id: string;
  name: string;
  createdAt: string;
}

interface MoitGridProps {
  onSelect: (moitId: string) => void;
  moitList?: Moit[];
  // Use to pass document counts for each MOIT folder
  docCounts?: Record<string, number>;
  canManage?: boolean;
  canDelete?: boolean;
  onAddMoitClick?: () => void;
  onDeleteMoit?: (moitId: string) => void;
}

const DEFAULT_MOITS = Array.from({ length: 22 }, (_, i) => ({
  id: `MOIT ${i + 1}`,
  name: `MOIT ${i + 1}`,
  createdAt: new Date().toISOString()
}));

export default function MoitGrid({ onSelect, moitList = DEFAULT_MOITS, docCounts = {}, canManage = false, canDelete = false, onAddMoitClick, onDeleteMoit }: MoitGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {moitList.map((moit, idx) => {
        const count = docCounts[moit.id] || 0;
        const hasDocs = count > 0;

        return (
          <div
            key={moit.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(moit.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(moit.id); }}
            className="group p-6 rounded-2xl transition-all duration-300 text-center flex flex-col items-center gap-4 relative overflow-hidden focus:outline-none hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
            style={{ animationDelay: `${idx * 40}ms`, background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-mid)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px var(--brand-border)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            <div
              className="p-5 rounded-2xl transition-all duration-300 transform group-hover:scale-110"
              style={hasDocs
                ? { background: 'var(--brand)', color: '#fff', border: '1px solid var(--brand-border)' }
                : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                📋
              </div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <h3 className="font-bold text-lg font-prompt mb-1" style={{ color: 'var(--text)' }}>{moit.name}</h3>
              
              <p 
                className="text-[11px] leading-relaxed font-prompt mb-3 opacity-80 min-h-[44px] flex items-center justify-center line-clamp-3"
                style={{ color: 'var(--text-muted)' }}
              >
                {MOIT_DESCRIPTIONS[moit.id] || 'รายละเอียดตัวชี้วัด'}
              </p>

              <div className="w-12 h-0.5 rounded-full mb-3" style={{ background: hasDocs ? 'var(--brand)' : 'var(--border)' }} />
              
              <p className="text-xs font-bold font-prompt" style={{ color: hasDocs ? 'var(--brand)' : 'var(--text-muted)' }}>
                {count} รายการ
              </p>
              {canDelete && onDeleteMoit && (
                <div className="mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`ยืนยันการลบ ${moit.name}?`)) {
                        onDeleteMoit(moit.id);
                      }
                    }}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-400 hover:bg-red-200 transition-colors"
                  >
                    ลบ
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add MOIT Card for Admins */}
      {canManage && onAddMoitClick && (
        <button
          onClick={onAddMoitClick}
          className="group p-6 rounded-2xl transition-all duration-300 text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden border-2 border-dashed border-opacity-50 hover:border-solid hover:scale-[1.02]"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--brand)', animationDelay: `${moitList.length * 40}ms` }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-110"
            style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}
          >
            <div className="text-3xl">+</div>
          </div>
          <div>
            <h3 className="font-bold text-lg font-prompt" style={{ color: 'var(--brand)' }}>เพิ่ม MOIT</h3>
            <p className="text-xs font-prompt" style={{ color: 'var(--text-muted)' }}>สร้างหมวดหมู่ใหม่</p>
          </div>
        </button>
      )}
    </div>
  );
}
