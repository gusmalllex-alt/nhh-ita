'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Shield, ShieldAlert, ShieldCheck, Trash2, RefreshCw, AlertCircle, Search, Edit2, Lock, Save, CheckCircle2 } from 'lucide-react';
import { getUsers, approveUser, deleteUser, updateUserRole, updateUser } from '@/lib/google-apps-script';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppUser {
  id: string;
  email: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: string;
  created_at: string;
}

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'ผู้ชม', icon: Shield, color: 'var(--text-muted) bg-opacity-10', bg: 'var(--bg-card)' },
  { value: 'staff', label: 'เจ้าหน้าที่', icon: ShieldCheck, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  { value: 'admin', label: 'ผู้ดูแลระบบ', icon: ShieldAlert, color: 'var(--brand)', bg: 'var(--brand-light)' },
];

function getRoleInfo(role: string) {
  return ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0];
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    newPassword: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data.map((u: any) => ({
        id: u.username,
        email: u.username,
        username: u.username,
        first_name: u.name?.split(' ')[0] || '',
        last_name: u.name?.split(' ')[1] || '',
        role: u.role || 'viewer',
        status: u.status || 'approved',
        created_at: new Date().toISOString(),
      })));
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name + ' ' + u.last_name).toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (username: string) => {
    setUpdatingId(username);
    try {
      const result = await approveUser(username);
      if (result.status === 'success') {
        setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, status: 'approved' } : u)));
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถอนุมัติผู้ใช้ได้');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (username: string, newRole: string) => {
    setUpdatingId(username);
    try {
      const result = await updateUserRole({ username, role: newRole });
      if (result.status === 'success') {
        setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, role: newRole } : u)));
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถอัปเดตสิทธิ์ได้');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (username: string) => {
    if (!confirm('ยืนยันการลบผู้ใช้นี้?')) return;
    try {
      const result = await deleteUser(username);
      if (result.status === 'success') {
        setUsers((prev) => prev.filter((u) => u.username !== username));
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถลบผู้ใช้ได้');
    }
  };

  const handleEditClick = (user: AppUser) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      username: user.username || '',
      newPassword: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !editingUser.username) return;
    setUpdatingId(editingUser.username);
    setError(null);

    try {
      const name = `${editFormData.firstName} ${editFormData.lastName}`;
      const result = await updateUser({ username: editingUser.username, name });
      
      if (result.status === 'success') {
        setUsers(prev => prev.map(u => 
          u.username === editingUser.username ? { 
            ...u, 
            first_name: editFormData.firstName, 
            last_name: editFormData.lastName,
          } : u
        ));
        setEditingUser(null);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setUpdatingId(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--text)',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="relative backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-mid)' }}
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full shrink-0" style={{ background: 'var(--brand)' }} />

            {/* Decorative */}
            <div 
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20" 
                style={{ background: 'var(--brand)' }}
            />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: 'var(--brand)', color: '#fff' }}>
                  <Users size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-prompt" style={{ color: 'var(--text)' }}>จัดการผู้ใช้งาน</h2>
                  <p className="text-xs font-prompt" style={{ color: 'var(--text-muted)' }}>กำหนดสิทธิ์และอนุมัติการเข้าถึงระบบ ITA</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="p-2 rounded-xl transition-all disabled:opacity-50"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  title="รีเฟรช"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
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
            </div>

            {/* Search */}
            <div className="px-6 pb-3 shrink-0">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อ หรืออีเมล..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl outline-none font-prompt text-sm transition-all"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mx-6 mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-prompt shrink-0">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* User List – scrollable */}
            <div className="overflow-y-auto px-6 pb-6 flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
                  <div className="w-8 h-8 border-3 border-t-brand rounded-full animate-spin mb-3" style={{ borderColor: 'var(--brand-light)' }} />
                  <p className="text-sm font-prompt">กำลังโหลดข้อมูล...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: 'var(--bg-card)' }}>
                    <Users size={32} />
                  </div>
                  <p className="text-sm font-prompt">ไม่พบผู้ใช้งาน</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map((user, idx) => {
                    const roleInfo = getRoleInfo(user.role);
                    const RoleIcon = roleInfo.icon;
                    const isUpdating = updatingId === user.id;
                    const isPending = user.status === 'pending';

                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 rounded-2xl transition-all animate-in fade-in duration-200"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', animationDelay: `${idx * 30}ms` }}
                      >
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-mid)' }}>
                          <Mail size={18} style={{ color: isPending ? 'var(--text-muted)' : 'var(--brand)' }} />
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold font-prompt truncate" style={{ color: 'var(--text)' }}>
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : user.email.split('@')[0]}
                            </p>
                            {isPending && (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-prompt truncate" style={{ color: 'var(--text-muted)' }}>
                            {user.email} {user.username && `· @${user.username}`}
                          </p>
                        </div>

                        {/* Actions Zone */}
                        <div className="flex items-center gap-3 shrink-0">
                          {isPending ? (
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={isUpdating}
                              className="btn-pill btn-pill-primary flex items-center gap-2 py-2 px-4 text-xs font-bold font-prompt"
                            >
                              {isUpdating ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                              อนุมัติ
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                                <span 
                                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                                    style={{ background: roleInfo.bg, color: roleInfo.color, border: `1px solid ${roleInfo.bg}` }}
                                >
                                    <RoleIcon size={12} />
                                    {roleInfo.label}
                                </span>
                                <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    disabled={isUpdating}
                                    className="text-xs py-1.5 px-2 rounded-xl outline-none transition-all cursor-pointer font-prompt font-bold"
                                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', color: 'var(--text)' }}
                                >
                                    {ROLE_OPTIONS.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                          )}

                          <div className="flex items-center border-l dark:border-white/10 pl-2 gap-1">
                            <button
                                onClick={() => handleEditClick(user)}
                                className="p-2 rounded-xl transition-all"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                            >
                                <Edit2 size={14} />
                            </button>
                            <button
                                onClick={() => handleDelete(user.id)}
                                className="p-2 rounded-xl transition-all text-red-400 hover:text-red-500 hover:bg-red-50"
                            >
                                <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 pt-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-[10px] uppercase font-bold tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>
                ผู้ใช้ทั้งหมด {users.length} รายการ · ระบบจัดการสิทธิ์ ITA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setEditingUser(null)} />
          <div 
            className="relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 flex flex-col"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-mid)' }}
          >
            <div className="flex items-center justify-between pb-4 border-b dark:border-white/10 mb-5">
              <h3 className="font-bold font-prompt" style={{ color: 'var(--text)' }}>แก้ไขข้อมูลผู้ใช้</h3>
              <button 
                onClick={() => setEditingUser(null)} 
                className="p-1.5 rounded-xl transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}
              >
                <X size={18}/>
              </button>
            </div>
            
            <div className="space-y-4 font-prompt">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>ชื่อ</label>
                    <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={e => setEditFormData({...editFormData, firstName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>นามสกุล</label>
                    <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={e => setEditFormData({...editFormData, lastName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={inputStyle}
                    />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Username</label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={e => setEditFormData({...editFormData, username: e.target.value})}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl text-sm opacity-50 cursor-not-allowed"
                  style={inputStyle}
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 rounded-full text-sm font-bold transition-all"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-mid)', color: 'var(--text-muted)' }}
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={updatingId === editingUser.id}
                  className="flex-1 py-3 rounded-full text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'var(--brand)' }}
                >
                  {updatingId === editingUser.id ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} 
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
