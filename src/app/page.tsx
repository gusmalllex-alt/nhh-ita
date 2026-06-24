'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Code } from 'lucide-react';
import FilterSection from '@/components/home/FilterSection';
import MoitGrid from '@/components/home/MoitGrid';
import DocumentList from '@/components/home/DocumentList';
import AuthModal from '@/components/modals/AuthModal';
import DocumentModal from '@/components/modals/DocumentModal';
import UserManagementModal from '@/components/modals/UserManagementModal';
import UserProfileModal from '@/components/modals/UserProfileModal';
import MoitManagementModal from '@/components/modals/MoitManagementModal';
import { getDocuments, getMoits, deleteMoit, type Document as GASDocument, type User as GASUser } from '@/lib/google-apps-script';
import { getCurrentFiscalYear } from '@/lib/fiscal-year';
import { MOIT_DESCRIPTIONS } from '@/lib/moit-data';

// Use the Document type from Google Apps Script
type Document = GASDocument;

export default function Home() {
  // --- Auth State ---
  const [user, setUser] = useState<GASUser | null>(null);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [authLoading, setAuthLoading] = useState(true);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMoitModal, setShowMoitModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  // --- Data States ---
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(getCurrentFiscalYear().toString());
  const [moitList, setMoitList] = useState<{ id: string; name: string; createdAt: string }[]>([]);
  const [selectedMoit, setSelectedMoit] = useState<string | null>(null);
  const [selectedRoundTab, setSelectedRoundTab] = useState("All");

  // ตรวจสอบ role ของผู้ใช้
  const isSuperAdmin = user?.username === 'admin' || userRole === 'admin';
  const isStaff = isSuperAdmin || userRole === 'staff';

  // --- Listen to Auth Session ---
  useEffect(() => {
    // Check for stored user in localStorage
    const storedUser = localStorage.getItem('ita_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserRole(parsedUser.role || 'staff');
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    setAuthLoading(false);
  }, []);

  // Function to reload auth state from localStorage
  const reloadAuth = () => {
    const storedUser = localStorage.getItem('ita_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserRole(parsedUser.role || 'staff');
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  };

  const fetchData = async (forceRefresh = false) => {
    console.log('fetchData called');
    setLoading(true);
    try {
      const data = await getDocuments(forceRefresh);
      console.log('Fetched documents (raw):', data);
      const normalized = data.map(item => ({
        ...item,
        fiscalYear: String(item.fiscalYear),
        description: String(item.description ?? ''),
      }));
      setItems(normalized);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoits = async (forceRefresh = false) => {
    try {
      const data = await getMoits(forceRefresh);
      setMoitList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching MOITs:', error);
    }
  };

  const handleManualRefresh = () => {
    fetchData(true);
    fetchMoits(true);
  };

  useEffect(() => {
    fetchData();
    fetchMoits();
  }, [selectedYear]);

  // --- Logic การนับจำนวนเอกสารต่อ MOIT ---
  const moitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      if (item.fiscalYear === selectedYear) {
        counts[item.moit] = (counts[item.moit] || 0) + 1;
      }
    });
    return counts;
  }, [items, selectedYear]);

  // --- Logic การกรองรายการเอกสาร ---
  const filteredItems = useMemo(() => {
    if (!selectedMoit) return [];

    console.log('Filtering items:', {
      totalItems: items.length,
      selectedYear,
      selectedMoit,
      selectedRoundTab
    });

    const filtered = items.filter(item => {
      const matchYear = item.fiscalYear === selectedYear;
      const matchMoit = item.moit === selectedMoit;

      // Handle both old (6M/12M) and new (6 เดือน/12 เดือน) quarter values
      let matchRound = selectedRoundTab === "All";
      if (!matchRound) {
        if (selectedRoundTab === "6 เดือน" || selectedRoundTab === "รอบ 6 เดือน") {
          matchRound = item.quarter === "6 เดือน" || item.quarter === "6M" || item.quarter === "รอบ 6 เดือน";
        } else if (selectedRoundTab === "12 เดือน" || selectedRoundTab === "รอบ 12 เดือน") {
          matchRound = item.quarter === "12 เดือน" || item.quarter === "12M" || item.quarter === "รอบ 12 เดือน";
        } else {
          matchRound = item.quarter === selectedRoundTab;
        }
      }

      console.log(`Item ${item.id}:`, {
        fiscalYear: item.fiscalYear,
        moit: item.moit,
        quarter: item.quarter,
        matchYear,
        matchMoit,
        matchRound
      });

      return matchYear && matchMoit && matchRound;
    });

    console.log('Filtered items count:', filtered.length);
    return filtered;
  }, [items, selectedYear, selectedMoit, selectedRoundTab]);

  const handleSignOut = () => {
    localStorage.removeItem('ita_user');
    setUser(null);
    setUserRole('viewer');
  };

  const handleAddMoit = () => {
    setShowMoitModal(true);
  };

  const handleDeleteMoit = async (moitId: string) => {
    const result = await deleteMoit(moitId);
    if (result.status === 'success') {
      await fetchMoits();
    } else {
      alert(result.message || 'ไม่สามารถลบ MOIT ได้');
    }
  };

  const [customYears, setCustomYears] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('ita_custom_years');
    if (stored) {
      try {
        setCustomYears(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing custom years', e);
      }
    }
  }, []);

  const handleAddYear = (newYear: string) => {
    if (!customYears.includes(newYear)) {
      const updated = [...customYears, newYear];
      setCustomYears(updated);
      localStorage.setItem('ita_custom_years', JSON.stringify(updated));
    }
    setSelectedYear(newYear);
  };

  const baseYears = ['2569', '2568']; // Removed 2566, 2567
  const dbYears = items.map(i => String(i.fiscalYear));
  const availableYears = Array.from(new Set([...baseYears, ...customYears, ...dbYears])).sort().reverse();

  return (
    <main className="flex-1 flex flex-col w-full animate-in fade-in duration-500 pb-20" style={{ background: 'var(--bg)' }}>
      <div className="container mx-auto px-4 mt-6">
        {/* ส่วนตัวกรอง */}
        <FilterSection
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMoit={selectedMoit}
          setSelectedMoit={setSelectedMoit}
          selectedRoundTab={selectedRoundTab}
          setSelectedRoundTab={setSelectedRoundTab}
          isAdmin={isSuperAdmin}
          isStaff={isStaff}
          user={user}
          authLoading={authLoading}
          onLoginClick={() => setShowAuthModal(true)}
          onLogoutClick={handleSignOut}
          onUploadClick={() => setShowDocumentModal(true)}
          onManageUsersClick={() => setShowUserModal(true)}
          onProfileClick={() => setShowProfileModal(true)}
          onAddMoitClick={handleAddMoit}
          onRefresh={handleManualRefresh}
          availableYears={availableYears}
          onAddYear={handleAddYear}
        />

        {/* ส่วนแสดงเนื้อหาหลัก */}
        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative w-24 h-24 mb-6">
                <svg className="animate-spin w-24 h-24" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e0f2fe" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" strokeDasharray="283" strokeDashoffset="75">
                    <animate attributeName="stroke-dashoffset" from="283" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#e0f2fe" strokeWidth="6" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" strokeDasharray="220" strokeDashoffset="110">
                    <animate attributeName="stroke-dashoffset" from="220" to="0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="50" cy="50" r="25" fill="none" stroke="#e0f2fe" strokeWidth="4" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeDasharray="157" strokeDashoffset="157">
                    <animate attributeName="stroke-dashoffset" from="157" to="0" dur="0.9s" repeatCount="indefinite" />
                  </circle>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <p className="font-semibold text-xl text-slate-700 font-prompt mb-2">กำลังโหลดข้อมูลเอกสาร...</p>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          ) : !selectedMoit ? (
            /* แสดง Grid ของ MOIT 1-22 */
            <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <div
                  className="inline-flex items-center gap-3 rounded-2xl px-5 py-3"
                  style={{ background: 'rgba(0,0,0,0.08)', border: '1px solid var(--brand-border)', backdropFilter: 'blur(8px)' }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: 'var(--brand)', boxShadow: '0 0 8px 2px var(--brand-border)' }}
                  />
                  <h2 className="text-xl font-semibold tracking-wide font-prompt" style={{ color: 'var(--text)' }}>
                    หมวดหมู่ตัวชี้วัด
                    <span className="ml-2 font-bold" style={{ color: 'var(--brand)' }}>(MOIT)</span>
                  </h2>
                </div>
              </div>
              <MoitGrid
                moitList={moitList.length > 0 ? moitList : undefined}
                onSelect={setSelectedMoit}
                docCounts={moitCounts}
                canManage={isSuperAdmin}
                canDelete={isSuperAdmin}
                onAddMoitClick={handleAddMoit}
                onDeleteMoit={handleDeleteMoit}
              />
            </div>
          ) : (
            /* แสดงรายการเอกสารใน MOIT ที่เลือก */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex items-center gap-3 rounded-2xl px-5 py-3"
                    style={{ background: 'rgba(0,0,0,0.08)', border: '1px solid var(--brand-border)', backdropFilter: 'blur(8px)' }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: 'var(--brand)', boxShadow: '0 0 8px 2px var(--brand-border)' }}
                    />
                    <h2 className="text-xl font-semibold tracking-wide font-prompt flex items-center gap-2" style={{ color: 'var(--text)' }}>
                      {selectedMoit}
                      {MOIT_DESCRIPTIONS[selectedMoit] && (
                        <span className="text-sm font-normal opacity-70 border-l pl-2 dark:border-white/20">
                          {MOIT_DESCRIPTIONS[selectedMoit]}
                        </span>
                      )}
                    </h2>
                    <span
                      className="px-3 py-1 rounded-lg text-sm font-bold"
                      style={{ background: 'var(--brand-light)', border: '1px solid var(--brand-border)', color: 'var(--brand)' }}
                    >
                      {filteredItems.length} รายการ
                    </span>
                  </div>
                </div>
              </div>

              <DocumentList
                documents={filteredItems}
                isAdmin={isStaff}
                onDocumentDeleted={() => fetchData(true)}
                onEdit={(doc) => {
                  setEditingDoc(doc);
                  setShowDocumentModal(true);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="mt-20 py-10 backdrop-blur-sm"
        style={{ background: 'var(--footer-bg)', borderTop: '1px solid var(--footer-divider)' }}
      >
        <div className="container mx-auto px-4 text-center space-y-3">

          {/* Logo + ชื่อโรงพยาบาล */}
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
            >
              <span className="text-white font-bold text-sm">ITA</span>
            </div>
            <p className="text-lg font-bold font-prompt" style={{ color: 'var(--footer-text)' }}>
              {new Date().getFullYear()} โรงพยาบาลหนองหาน อำเภอหนองหาน จังหวัดอุดรธานี
            </p>
          </div>

          {/* ชื่อระบบ */}
          <p className="text-sm font-medium font-prompt" style={{ color: 'var(--footer-sub)' }}>
            MOPH Open Data Integrity and Transparency Assessment (ITA) Portal
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="h-px w-16" style={{ background: 'var(--footer-divider)' }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--footer-muted)', opacity: 0.7 }} />
            <div className="h-px w-16" style={{ background: 'var(--footer-divider)' }} />
          </div>

          {/* Developer credit */}
          <div
            className="inline-flex items-center gap-3 rounded-xl px-4 py-2"
            style={{ border: '1px solid var(--border-mid)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--brand)' }}>
              <Code size={16} color="#ffffff" />
            </div>
            <p className="text-xs font-prompt" style={{ color: 'var(--footer-sub)' }}>
              พัฒนาโดย <span className="font-bold" style={{ color: 'var(--brand)' }}>นายศุภชัย สุนารักษ์</span> &nbsp;&middot;&nbsp; นักวิชาการสถิติ &nbsp;&middot;&nbsp; กลุ่มงานสุขภาพดิจิทัล
            </p>
          </div>

        </div>
      </footer>

      {/* === Modals === */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          reloadAuth();
          setShowAuthModal(false);
        }}
      />
      <DocumentModal
        isOpen={showDocumentModal}
        editDoc={editingDoc}
        currentYear={selectedYear}
        onClose={() => {
          setShowDocumentModal(false);
          setEditingDoc(null);
        }}
        onUploadSuccess={() => {
          setShowDocumentModal(false);
          setEditingDoc(null);
          fetchData(true);
        }}
      />
      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
      />
      {user && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={user.username}
        />
      )}
      <MoitManagementModal
        isOpen={showMoitModal}
        onClose={() => setShowMoitModal(false)}
        onAddSuccess={fetchMoits}
      />
    </main>
  );
}
