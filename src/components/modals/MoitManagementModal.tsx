'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles, FolderPlus, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { addMoit } from '@/lib/google-apps-script';

interface MoitManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess: () => void;
}

export default function MoitManagementModal({ isOpen, onClose, onAddSuccess }: MoitManagementModalProps) {
  const [moitId, setMoitId] = useState('');
  const [moitName, setMoitName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!moitId.trim() || !moitName.trim()) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      setLoading(false);
      return;
    }

    try {
      const result = await addMoit({ id: moitId.trim(), name: moitName.trim() });
      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          setMoitId('');
          setMoitName('');
          setSuccess(false);
          onAddSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error(result.message || 'ไม่สามารถเพิ่ม MOIT ได้');
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputStyle = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--text)',
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={e => e.stopPropagation()}
        >
          <div 
            className="rounded-3xl overflow-hidden flex flex-col glass-modal relative"
          >
            {/* Top accent gradient */}
            <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500" />

            {/* Decorative */}
            <div 
                className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 bg-gradient-to-br from-emerald-400 to-teal-500" 
            />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'var(--brand)', color: '#fff' }}>
                  <FolderPlus size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-prompt" style={{ color: 'var(--text)' }}>เพิ่มหัวข้อ MOIT</h2>
                  <p className="text-xs font-prompt" style={{ color: 'var(--text-muted)' }}>สร้างหมวดหมู่ใหม่สำหรับระบบ ITA</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 pt-2">
              {success ? (
                <div className="flex flex-col items-center justify-center py-8 animate-in zoom-in-95 duration-300 text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-emerald-50 text-emerald-500 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold font-prompt" style={{ color: 'var(--text)' }}>เพิ่มสำเร็จ!</h3>
                  <p className="text-sm font-prompt mt-1" style={{ color: 'var(--text-muted)' }}>กำลังอัปเดตรายการ...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 text-sm px-4 py-3 rounded-xl font-prompt animate-in fade-in duration-200">
                      <AlertCircle size={15} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider pl-1" style={{ color: 'var(--text-muted)' }}>
                      MOIT รหัส (ID)
                    </label>
                    <input
                      type="text"
                      value={moitId}
                      onChange={(e) => setMoitId(e.target.value)}
                      placeholder="ตัวอย่าง: MOIT 23"
                      className="w-full px-4 py-3 rounded-2xl outline-none font-prompt text-sm transition-all focus:ring-2 focus:ring-opacity-20"
                      style={{ ...inputStyle, borderColor: 'var(--border-mid)' }}
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider pl-1" style={{ color: 'var(--text-muted)' }}>
                      ชื่อหัวข้อ MOIT
                    </label>
                    <input
                      type="text"
                      value={moitName}
                      onChange={(e) => setMoitName(e.target.value)}
                      placeholder="ระบุชื่อหัวข้อ..."
                      className="w-full px-4 py-3 rounded-2xl outline-none font-prompt text-sm transition-all focus:ring-2 focus:ring-opacity-20"
                      style={{ ...inputStyle, borderColor: 'var(--border-mid)' }}
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3.5 rounded-full text-sm font-bold font-prompt transition-all hover:brightness-95 active:scale-95"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', color: 'var(--text-muted)' }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 rounded-full text-sm font-bold font-prompt text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                      style={{ background: 'var(--brand)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                    >
                      {loading ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <>
                          <Plus size={18} />
                          เพิ่มหัวข้อ
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 pt-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-center" style={{ color: 'var(--text-muted)' }}>
                Nonghan Hospital ITA Management
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
