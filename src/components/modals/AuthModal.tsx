'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { authenticateUser, registerUser, type UserData } from '@/lib/google-apps-script';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

type AuthMode = 'login' | 'register';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setError(null);
    setSuccessMsg(null);
    setIdentifier('');
    setEmail('');
    setUsername('');
    setFirstName('');
    setLastName('');
    setPassword('');
  };

  const switchMode = (newMode: AuthMode) => {
    resetState();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === 'login') {
        const result = await authenticateUser(identifier, password);
        if (result.success && result.user) {
          localStorage.setItem('ita_user', JSON.stringify(result.user));
          setSuccessMsg('เข้าสู่ระบบสำเร็จ');
          setTimeout(() => onAuthSuccess(), 1000);
        } else {
          throw new Error(result.message || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      } else {
        const userData: UserData = {
          username,
          password,
          name: `${firstName} ${lastName}`,
        };
        const result = await registerUser(userData);
        if (result.status === 'success') {
          setSuccessMsg('สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ');
        } else {
          throw new Error(result.message || 'สมัครสมาชิกไม่สำเร็จ');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  /* Shared input class */
  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--text)',
  };
  const inputClass =
    'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all font-prompt placeholder:opacity-50';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden modal-pop relative"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent bar — brand green */}
          <div className="h-1 w-full" style={{ background: 'var(--brand)' }} />

          {/* Subtle background blob */}
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-20" style={{ background: 'var(--brand)' }} />

          <div className="relative p-8">

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl transition-all z-10"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--brand)', color: '#fff' }}
              >
                {mode === 'login' ? <LogIn size={30} /> : <UserPlus size={30} />}
              </div>
              <h2 className="text-2xl font-bold font-prompt mb-1" style={{ color: 'var(--text)' }}>
                {mode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </h2>
              <p className="text-sm font-prompt" style={{ color: 'var(--text-muted)' }}>
                {mode === 'login' ? 'เข้าสู่ระบบเพื่อจัดการเอกสาร ITA' : 'สร้างบัญชีใหม่สำหรับระบบ ITA'}
              </p>
            </div>

            {/* Mode Tabs */}
            <div
              className="flex p-1 rounded-2xl mb-6 gap-1"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {(['login', 'register'] as AuthMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 font-prompt"
                  style={mode === m ? {
                    background: 'var(--bg-surface)',
                    color: 'var(--brand)',
                    border: '1px solid var(--brand-border)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  } : {
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                  }}
                >
                  {m === 'login' ? <LogIn size={14} /> : <UserPlus size={14} />}
                  {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                </button>
              ))}
            </div>

            {/* Alerts */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 font-prompt animate-in fade-in duration-200">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}
            {successMsg && (
              <div
                className="flex items-start gap-2 text-sm px-4 py-3 rounded-xl mb-4 font-prompt animate-in fade-in duration-200"
                style={{ background: 'var(--brand-light)', border: '1px solid var(--brand-border)', color: 'var(--brand)' }}
              >
                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                <p>{successMsg}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {mode === 'register' && (
                <>
                  {/* ชื่อ + นามสกุล */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide font-prompt" style={{ color: 'var(--text-muted)' }}>
                        ชื่อจริง
                      </label>
                      <input
                        type="text" value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="ชื่อ" required={mode === 'register'}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wide font-prompt" style={{ color: 'var(--text-muted)' }}>
                        นามสกุล
                      </label>
                      <input
                        type="text" value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="นามสกุล" required={mode === 'register'}
                        className={inputClass} style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide font-prompt" style={{ color: 'var(--text-muted)' }}>
                      ชื่อผู้ใช้งาน
                    </label>
                    <div className="relative">
                      <UserPlus size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text" value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ตั้ง Username สำหรับล็อกอิน"
                        required={mode === 'register'}
                        className={`${inputClass} pl-10`} style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide font-prompt" style={{ color: 'var(--text-muted)' }}>
                      อีเมล
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required={mode === 'register'}
                        className={`${inputClass} pl-10`} style={inputStyle}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Login identifier */}
              {mode === 'login' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide font-prompt" style={{ color: 'var(--text-muted)' }}>
                    อีเมล หรือ ชื่อผู้ใช้งาน
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text" value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="กรอกอีเมล หรือ Username"
                      required={mode === 'login'}
                      className={`${inputClass} pl-10`} style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide font-prompt" style={{ color: 'var(--text-muted)' }}>
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="รหัสผ่าน"
                    required
                    className={`${inputClass} pl-10 pr-10`}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {mode === 'register' && (
                  <p className="text-xs font-prompt" style={{ color: 'var(--text-muted)' }}>
                    รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
                  </p>
                )}
              </div>

              {/* Submit Button — pill style DESIGN.md */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-prompt mt-2"
                style={{ background: 'var(--brand)', color: '#ffffff', border: '1px solid var(--brand-hover)' }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    กำลังดำเนินการ...
                  </>
                ) : mode === 'login' ? (
                  <><LogIn size={16} /> เข้าสู่ระบบ</>
                ) : (
                  <><UserPlus size={16} /> สมัครสมาชิก</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
