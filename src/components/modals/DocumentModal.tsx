'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, FileText, Trash2, CheckCircle, AlertCircle, FolderOpen, CloudUpload, Pencil } from 'lucide-react';
import { uploadDocument, editDocument, type UploadData, type Document as GASDocument } from '@/lib/google-apps-script';
import { getFiscalYearOptions, getCurrentFiscalYear } from '@/lib/fiscal-year';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  editDoc?: GASDocument | null;
  currentYear?: string;
  availableYears?: string[];
}

interface FilePreview {
  file: File;
}

const MOIT_OPTIONS = Array.from({ length: 22 }, (_, i) => `MOIT ${i + 1}`);
const YEAR_OPTIONS = getFiscalYearOptions(2);
const QUARTER_OPTIONS = [
  { value: '6 เดือน', label: '6 เดือน' },
  { value: '12 เดือน', label: '12 เดือน' },
];

export default function DocumentModal({
  isOpen,
  onClose,
  onUploadSuccess,
  editDoc = null,
  currentYear,
  availableYears = ['2569', '2568']
}: DocumentModalProps) {
  const isEditMode = !!editDoc;

  const [dragging, setDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moit, setMoit] = useState('MOIT 1');
  const [year, setYear] = useState(currentYear || getCurrentFiscalYear().toString());
  const [quarter, setQuarter] = useState('6 เดือน');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editDoc) {
      setTitle(editDoc.title ?? '');
      setDescription(editDoc.description ?? '');
      setMoit(editDoc.moit ?? 'MOIT 1');
      setYear(String(editDoc.fiscalYear ?? currentYear ?? getCurrentFiscalYear().toString()));
      setQuarter(editDoc.quarter ?? '6 เดือน');
      setFilePreview(null);
      setError(null);
      setSuccess(false);
      setProgress(0);
    } else {
      setFilePreview(null);
      setTitle('');
      setDescription('');
      setMoit('MOIT 1');
      setYear(currentYear || getCurrentFiscalYear().toString());
      setQuarter('6 เดือน');
      setError(null);
      setSuccess(false);
      setProgress(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDoc, isOpen, currentYear]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > 35 * 1024 * 1024) {
      setError('ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 35 MB)');
      return;
    }
    setFilePreview({ file });
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (err) => reject(err);
    });

  const handleSubmit = async () => {
    if (!title.trim()) { setError('กรุณาระบุชื่อเอกสาร'); return; }
    if (!isEditMode && !filePreview) { setError('กรุณาเลือกไฟล์'); return; }

    setUploading(true);
    setError(null);
    setProgress(10);

    try {
      const storedUser = localStorage.getItem('ita_user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      setProgress(30);

      if (isEditMode && editDoc) {
        let base64Data = '';
        let mimeType = '';
        let filename = editDoc.fileName ?? '';
        if (filePreview) {
          base64Data = await fileToBase64(filePreview.file);
          mimeType = filePreview.file.type;
          filename = filePreview.file.name;
        }
        setProgress(60);
        const result = await editDocument({
          id: editDoc.id, fiscalYear: year, moit, quarter, title, description,
          file: base64Data, mimeType, filename, user: userData?.username || 'Anonymous',
        });
        setProgress(90);
        if (result.status === 'success') {
          setProgress(100); setSuccess(true);
          setTimeout(() => { onUploadSuccess(); handleClose(); }, 1200);
        } else throw new Error(result.message || 'แก้ไขเอกสารไม่สำเร็จ');
      } else {
        const file = filePreview!.file;
        const base64Data = await fileToBase64(file);
        setProgress(50);
        const uploadData: UploadData = {
          fiscalYear: year, moit, quarter, title, description,
          file: base64Data, mimeType: file.type, filename: file.name,
          user: userData?.username || 'Anonymous',
        };
        const result = await uploadDocument(uploadData);
        setProgress(90);
        if (result.status === 'success') {
          setProgress(100); setSuccess(true);
          setTimeout(() => { onUploadSuccess(); handleClose(); }, 1500);
        } else throw new Error(result.message || 'อัปโหลดไฟล์ไม่สำเร็จ');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setUploading(false);
    }
  };

  const handleResetForm = () => {
    setFilePreview(null); setTitle(''); setDescription('');
    setMoit('MOIT 1'); setYear(currentYear || getCurrentFiscalYear().toString());
    setQuarter('6 เดือน'); setError(null); setSuccess(false); setProgress(0);
  };

  const handleClose = () => { handleResetForm(); onClose(); };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /* ── Shared select style ── */
  const selectStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--text)',
  };
  const selectClass = 'w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none font-prompt transition-all cursor-pointer';

  const inputStyle: React.CSSProperties = {
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    color: 'var(--text)',
  };
  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none font-prompt transition-all placeholder:opacity-50';

  /* Edit mode accent = amber, create mode = brand green */
  const accentColor = isEditMode ? '#f59e0b' : 'var(--brand)';
  const accentBg    = isEditMode ? '#fef3c7' : 'var(--brand-light)';
  const accentBorder= isEditMode ? '#fde68a' : 'var(--brand-border)';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="relative rounded-3xl overflow-hidden flex flex-col glass-modal"
          >
            {/* Top accent bar */}
            <div className="h-1.5 w-full shrink-0" style={{ background: accentColor }} />

            {/* Decorative blob */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-15"
              style={{ background: accentColor }}
            />

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: accentColor, color: '#fff' }}
                >
                  {isEditMode ? <Pencil size={18} /> : <CloudUpload size={18} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold font-prompt" style={{ color: 'var(--text)' }}>
                    {isEditMode ? 'แก้ไขเอกสาร' : 'อัปโหลดเอกสาร'}
                  </h2>
                  <p className="text-xs font-prompt" style={{ color: 'var(--text-muted)' }}>
                    {isEditMode ? `กำลังแก้ไข: ${editDoc?.title}` : 'อัปโหลดไฟล์เอกสาร ITA เข้าสู่ระบบ'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body – scrollable */}
            <div className="overflow-y-auto px-6 pb-6 space-y-4 relative">

              {/* Success State */}
              {success ? (
                <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in-95 duration-300">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
                  >
                    <CheckCircle size={36} style={{ color: accentColor }} />
                  </div>
                  <p className="text-lg font-bold font-prompt" style={{ color: 'var(--text)' }}>
                    {isEditMode ? 'แก้ไขสำเร็จ!' : 'อัปโหลดสำเร็จ!'}
                  </p>
                  <p className="text-sm font-prompt mt-1" style={{ color: 'var(--text-muted)' }}>กำลังรีเฟรชข้อมูล...</p>
                </div>
              ) : (
                <>
                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl font-prompt animate-in fade-in duration-200">
                      <AlertCircle size={15} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Drop Zone */}
                  {!filePreview ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group"
                      style={{
                        borderColor: dragging ? accentColor : 'var(--border-mid)',
                        background: dragging ? accentBg : 'var(--bg-card)',
                      }}
                    >
                      <div
                        className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all"
                        style={{ background: dragging ? accentBg : 'var(--bg-surface)', border: '1px solid var(--border)' }}
                      >
                        <Upload size={24} style={{ color: dragging ? accentColor : 'var(--text-muted)' }} />
                      </div>
                      <p className="font-bold font-prompt mb-1" style={{ color: 'var(--text)' }}>
                        {isEditMode
                          ? (dragging ? 'วางไฟล์ที่นี่' : 'เปลี่ยนไฟล์ (ไม่บังคับ)')
                          : (dragging ? 'วางไฟล์ที่นี่' : 'ลากไฟล์มาวาง หรือคลิกเพื่อเลือก')}
                      </p>
                      {isEditMode && editDoc?.fileName && (
                        <p className="text-xs font-prompt mt-1" style={{ color: 'var(--text-muted)' }}>
                          ไฟล์ปัจจุบัน: <span className="font-semibold" style={{ color: accentColor }}>{editDoc.fileName}</span>
                        </p>
                      )}
                      <p className="text-xs font-prompt mt-1" style={{ color: 'var(--text-muted)' }}>PDF, Word, Excel, รูปภาพ (สูงสุด 35 MB)</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                      />
                    </div>
                  ) : (
                    /* File Preview Card */
                    <div
                      className="flex items-center gap-3 rounded-2xl p-4"
                      style={{ background: accentBg, border: `1px solid ${accentBorder}` }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
                      >
                        <FileText size={20} style={{ color: accentColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold font-prompt truncate" style={{ color: 'var(--text)' }}>{filePreview.file.name}</p>
                        <p className="text-xs font-prompt" style={{ color: 'var(--text-muted)' }}>{formatBytes(filePreview.file.size)}</p>
                      </div>
                      <button
                        onClick={() => setFilePreview(null)}
                        className="p-1 rounded-lg transition-colors text-red-400 hover:text-red-600 hover:bg-red-50"
                        title="ยกเลิกไฟล์นี้"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-3">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1 font-prompt" style={{ color: 'var(--text-muted)' }}>
                        ชื่อเอกสาร <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="เช่น รายงานผลการดำเนินงาน MOIT 1 ปีงบประมาณ 2569"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1 font-prompt" style={{ color: 'var(--text-muted)' }}>
                        คำอธิบาย (ไม่บังคับ)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="รายละเอียดเพิ่มเติม..."
                        rows={2}
                        className={`${inputClass} resize-none`}
                        style={inputStyle}
                      />
                    </div>

                    {/* Row: MOIT + Year + Quarter */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 font-prompt" style={{ color: 'var(--text-muted)' }}>
                          MOIT
                        </label>
                        <div className="relative">
                          <FolderOpen size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                          <select
                            value={moit}
                            onChange={(e) => setMoit(e.target.value)}
                            className={`${selectClass} pl-7`}
                            style={selectStyle}
                          >
                            {MOIT_OPTIONS.map((m) => (
                              <option key={m} value={m} style={{ background: 'var(--bg-surface)', color: 'var(--text)' }}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 font-prompt" style={{ color: 'var(--text-muted)' }}>
                          ปีงบประมาณ
                        </label>
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className={selectClass}
                          style={selectStyle}
                        >
                          {availableYears.map((y) => (
                            <option key={y} value={y} style={{ background: 'var(--bg-surface)', color: 'var(--text)' }}>{y}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide mb-1 font-prompt" style={{ color: 'var(--text-muted)' }}>
                          รอบ
                        </label>
                        <select
                          value={quarter}
                          onChange={(e) => setQuarter(e.target.value)}
                          className={selectClass}
                          style={selectStyle}
                        >
                          {QUARTER_OPTIONS.map((q) => (
                            <option key={q.value} value={q.value} style={{ background: 'var(--bg-surface)', color: 'var(--text)' }}>{q.value}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploading && (
                    <div className="space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex justify-between text-xs font-prompt" style={{ color: 'var(--text-muted)' }}>
                        <span>{isEditMode ? 'กำลังบันทึก...' : 'กำลังอัปโหลด...'}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%`, background: accentColor }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 rounded-full font-semibold text-sm transition-all font-prompt"
                      style={{ border: '1px solid var(--border-mid)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={uploading || (!isEditMode && !filePreview)}
                      className="flex-1 py-3 rounded-full text-white font-bold text-sm active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-prompt"
                      style={{ background: accentColor, border: `1px solid ${accentBorder}` }}
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          {isEditMode ? 'กำลังบันทึก...' : 'กำลังอัปโหลด...'}
                        </>
                      ) : (
                        <>
                          {isEditMode ? <Pencil size={16} /> : <Upload size={16} />}
                          {isEditMode ? 'บันทึกการแก้ไข' : 'อัปโหลดเอกสาร'}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
