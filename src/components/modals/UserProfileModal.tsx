'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Lock, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { updateUser, changePassword } from '@/lib/google-apps-script';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function UserProfileModal({ isOpen, onClose, userId }: UserProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccess(null);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      fetchUserProfile();
    }
  }, [isOpen, userId]);

  const fetchUserProfile = async () => {
    setIsFetching(true);
    try {
      const storedUser = localStorage.getItem('ita_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setFormData({
          firstName: parsedUser.name?.split(' ')[0] || '',
          lastName: parsedUser.name?.split(' ')[1] || '',
          username: parsedUser.username || '',
          email: parsedUser.username || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถดึงข้อมูลโปรไฟล์ได้');
    } finally {
      setIsFetching(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const name = `${formData.firstName} ${formData.lastName}`;
      const result = await updateUser({ username: userId, name });

      if (result.status === 'success') {
        // Update localStorage
        const storedUser = localStorage.getItem('ita_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.name = name;
          localStorage.setItem('ita_user', JSON.stringify(parsedUser));
        }

        setSuccess('อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword.length < 6) {
      return setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('รหัสผ่านใหม่ไม่ตรงกัน');
    }

    setLoading(true);

    try {
      const result = await changePassword({ username: userId, password: passwordData.newPassword });

      if (result.status === 'success') {
        setSuccess('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300 pointer-events-auto" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-3xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 pointer-events-auto glass-modal">
        
        {/* Top accent gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 z-20" />
        {/* Decorative blob */}
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 bg-gradient-to-br from-emerald-400 to-teal-500 z-0" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b z-10 shrink-0 relative" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: 'var(--brand)', color: '#fff' }}>
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-prompt" style={{ color: 'var(--text)' }}>โปรไฟล์ของฉัน</h2>
              <p className="text-xs font-prompt" style={{ color: 'var(--text-muted)' }}>จัดการข้อมูลส่วนตัวและรหัสผ่าน</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 text-red-600 text-sm font-prompt animate-in slide-in-from-top-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 text-emerald-600 text-sm font-prompt animate-in slide-in-from-top-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {isFetching ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="animate-spin text-emerald-500" size={24} />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Profile Form */}
              <form onSubmit={handleUpdateProfile} className="space-y-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 font-prompt border-b border-slate-100 pb-2">ข้อมูลส่วนตัว</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-prompt">อีเมล (ไม่สามารถเปลี่ยนได้)</label>
                  <input
                    type="text"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-prompt cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 font-prompt">ชื่อ</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-prompt transition-all"
                      placeholder="ชื่อ"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 font-prompt">นามสกุล</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-prompt transition-all"
                      placeholder="นามสกุล"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-prompt">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-prompt transition-all"
                    placeholder="Username ตัวอย่าง: doctor_123"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 font-prompt"
                >
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                  บันทึกข้อมูลส่วนตัว
                </button>
              </form>

              {/* Password Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Lock size={16} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-800 font-prompt">เปลี่ยนรหัสผ่าน</h3>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-prompt">รหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-prompt transition-all"
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1 font-prompt">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-prompt transition-all"
                    placeholder="กรอกให้ตรงกับรหัสผ่านใหม่"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !passwordData.newPassword}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 font-prompt"
                >
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />}
                  เปลี่ยนรหัสผ่าน
                </button>
              </form>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
