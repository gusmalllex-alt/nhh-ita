'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Filter, RefreshCw, LayoutGrid, FolderOpen,
  ChevronRight, ChevronDown, Layers, LogIn, LogOut, Users, Upload, User as UserIcon, Plus, Check
} from 'lucide-react';
import type { User as GASUser } from '@/lib/google-apps-script';
import { getFiscalYearOptions } from '@/lib/fiscal-year';

const FISCAL_YEARS = getFiscalYearOptions(2); // ปีปัจจุบัน + ย้อนหลัง 2 ปี (auto)
const QUARTERS = [
  { value: "6 เดือน", label: "รอบ 6 เดือน" },
  { value: "12 เดือน", label: "รอบ 12 เดือน" },
];

interface FilterSectionProps {
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  selectedMoit: string | null;
  setSelectedMoit: (m: string | null) => void;
  selectedRoundTab: string;
  setSelectedRoundTab: (r: string) => void;
  isAdmin?: boolean;
  isStaff?: boolean;
  user?: GASUser | null;
  authLoading?: boolean;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onUploadClick?: () => void;
  onManageUsersClick?: () => void;
  onProfileClick?: () => void;
  onAddMoitClick?: () => void;
  onRefresh?: () => void;
}

export default function FilterSection({
  selectedYear, setSelectedYear,
  selectedMoit, setSelectedMoit,
  selectedRoundTab, setSelectedRoundTab,
  isAdmin = false,
  isStaff = false,
  user = null,
  authLoading = false,
  onLoginClick,
  onLogoutClick,
  onUploadClick,
  onManageUsersClick,
  onProfileClick,
  onAddMoitClick,
  onRefresh
}: FilterSectionProps) {

  const [refreshing, setRefreshing] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const yearRef = useRef<HTMLDivElement>(null);

  // Close year dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  };



  return (
    <>
      <div
        className="rounded-3xl p-4 md:p-6 mb-8 sticky z-30 transition-all duration-300 top-[62px] sm:top-[62px] md:top-[68px] mt-4"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

          {/* Left: Breadcrumb / Title */}
          <div className="flex flex-wrap items-center gap-4 flex-1 w-full overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {selectedMoit ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedMoit(null); setSelectedRoundTab("All"); }}
                  className="flex items-center gap-2 transition-colors font-semibold px-4 py-2.5 rounded-xl active:scale-95 font-prompt text-sm"
                  style={{ color: 'var(--brand)', border: '1px solid var(--brand-border)', background: 'var(--brand-light)' }}
                >
                  <LayoutGrid size={18} /> หน้าหลัก
                </button>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold font-prompt text-sm"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', color: 'var(--text)' }}
                >
                  <FolderOpen size={18} style={{ color: 'var(--brand)' }} /> {selectedMoit}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--brand)', color: '#fff' }}
                >
                  <LayoutGrid size={22} />
                </div>
                <span className="font-bold text-xl font-prompt" style={{ color: 'var(--text)' }}>
                  เลือกหมวดหมู่เอกสาร ITA
                </span>
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Year Selector — custom dropdown (no OS blue) */}
            <div className="relative min-w-[180px]" ref={yearRef}>
              <button
                onClick={() => setShowYearDropdown(!showYearDropdown)}
                className="w-full flex items-center justify-between gap-2 pl-10 pr-3 py-2.5 rounded-xl text-sm font-bold font-prompt transition-all"
                style={{
                  background: 'var(--input-bg)',
                  border: showYearDropdown ? '1px solid var(--brand)' : '1px solid var(--border-mid)',
                  color: 'var(--text)',
                }}
              >
                <span>ปีงบ {selectedYear}</span>
                <ChevronDown
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    transform: showYearDropdown ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>
              <Filter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--brand)' }} />

              {showYearDropdown && (
                <div
                  className="absolute left-0 mt-1.5 w-full rounded-xl shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-mid)' }}
                >
                  {FISCAL_YEARS.map(year => (
                    <button
                      key={year}
                      onClick={() => { 
                        const yearStr = String(year);
                        setSelectedYear(yearStr); 
                        setShowYearDropdown(false); 
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-prompt transition-colors text-left"
                      style={{
                        color: String(year) === selectedYear ? 'var(--brand)' : 'var(--text)',
                        fontWeight: String(year) === selectedYear ? 700 : 400,
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      ปีงบ {year}
                      {String(year) === selectedYear && <Check size={14} style={{ color: 'var(--brand)' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl transition-all active:scale-95"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--brand)', color: 'var(--brand)' }}
              title="รีโหลดข้อมูล"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} style={{ color: refreshing ? 'var(--brand)' : 'inherit' }} />
            </button>

            {/* Role Messages and Controls */}

            {isStaff && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onUploadClick}
                  className="btn-pill btn-pill-primary flex items-center gap-2 px-4 py-2.5 font-prompt"
                  title="อัปโหลดเอกสาร"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">อัปโหลด</span>
                </button>
                {isAdmin && onAddMoitClick && (
                  <button
                    onClick={onAddMoitClick}
                    className="btn-pill flex items-center gap-2 px-4 py-2.5 font-prompt text-sm font-bold"
                    style={{ background: 'var(--brand)', color: '#fff', border: '1px solid var(--brand-hover)' }}
                    title="เพิ่ม MOIT"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">เพิ่ม MOIT</span>
                  </button>
                )}
              </div>
            )}
            
            {isAdmin && (
              <button
                onClick={onManageUsersClick}
                className="btn-pill-ghost flex items-center gap-2 px-4 py-2.5 font-prompt text-sm font-bold"
                title="จัดการผู้ใช้"
              >
                <Users size={16} />
                <span className="hidden sm:inline">ผู้ใช้</span>
              </button>
            )}

            {/* Auth Button */}
            {authLoading ? (
              <div
                className="w-8 h-8 border-2 rounded-full animate-spin"
                style={{ borderColor: 'var(--border-mid)', borderTopColor: 'var(--brand)' }}
              />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="btn-pill-ghost flex items-center gap-2 px-4 py-2.5 font-prompt text-sm font-bold"
                  title={user.username}
                >
                  <UserIcon size={16} />
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.username}</span>
                </button>

                {showUserDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserDropdown(false)}
                    ></div>
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-4 duration-200"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-mid)' }}
                    >
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onProfileClick?.();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-[var(--bg-card)] flex items-center gap-2 font-prompt transition-colors"
                        style={{ color: 'var(--text)' }}
                      >
                        <UserIcon size={16} style={{ color: 'var(--brand)' }} />
                        โปรไฟล์ของฉัน
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogoutClick?.();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 mt-1 pt-3 font-prompt transition-colors"
                        style={{ color: '#ef4444', borderTop: '1px solid var(--border)' }}
                      >
                        <LogOut size={16} style={{ color: '#ef4444' }} />
                        ออกจากระบบ
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* ปุ่ม เข้าสู่ระบบ — pill style จาก DESIGN.md */
              <button
                onClick={onLoginClick}
                className="btn-pill btn-pill-primary flex items-center gap-2 px-5 py-2 font-prompt text-sm"
              >
                <LogIn size={16} />
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quarter Tabs (shown only when a MOIT is selected) */}
      {selectedMoit && (
        <div className="flex overflow-x-auto gap-3 mb-8 pb-3 px-1 custom-scrollbar">
          <button
            onClick={() => setSelectedRoundTab("All")}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 shadow-md font-prompt ${
              selectedRoundTab === "All"
                ? "bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-blue-900/25 border border-blue-700"
                : "bg-white text-slate-700 hover:bg-blue-100 border-2 border-slate-300 hover:border-blue-700"
            }`}
          >
            <Layers size={16} /> ทั้งหมด
          </button>

          {QUARTERS.map(q => (
            <button
              key={q.value}
              onClick={() => setSelectedRoundTab(q.value)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap font-prompt ${
                selectedRoundTab === q.value ? '' : ''
              }`}
              style={selectedRoundTab === q.value ? {
                background: 'var(--brand)',
                color: '#ffffff',
                border: '1px solid var(--brand-hover)',
              } : {
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
