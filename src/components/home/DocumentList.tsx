'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Paperclip, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { deleteDocument, type Document as GASDocument } from '@/lib/google-apps-script';

interface DocumentListProps {
  documents: GASDocument[];
  isAdmin?: boolean;
  onEdit?: (doc: GASDocument) => void;
  onDocumentDeleted?: () => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * Natural numeric sort on title string.
 * Example order: 1, 1.1, 1.2, 2, 2.1, 2.2, 3, 3.1, 4.1
 */
function naturalTitleSort(a: GASDocument, b: GASDocument): number {
  const toSegments = (str: string): (number | string)[] =>
    str
      .split(/(\d+(?:\.\d+)*)/)
      .filter(Boolean)
      .map((s) => (/^\d+(\.\d+)*$/.test(s) ? parseFloat(s) : s.toLowerCase()));

  const segsA = toSegments(String(a.title ?? ''));
  const segsB = toSegments(String(b.title ?? ''));
  const len = Math.min(segsA.length, segsB.length);

  for (let i = 0; i < len; i++) {
    const sa = segsA[i];
    const sb = segsB[i];
    if (typeof sa === 'number' && typeof sb === 'number') {
      if (sa !== sb) return sa - sb;
    } else {
      const cmp = String(sa).localeCompare(String(sb), 'th', { numeric: true });
      if (cmp !== 0) return cmp;
    }
  }
  return segsA.length - segsB.length;
}

export default function DocumentList({
  documents,
  isAdmin = false,
  onEdit,
  onDocumentDeleted,
}: DocumentListProps) {
  const sortedDocuments = [...documents].sort(naturalTitleSort);

  // --- Pagination state ---
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(sortedDocuments.length / pageSize));

  // Reset to page 1 when documents or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [documents, pageSize]);

  const startIdx = (currentPage - 1) * pageSize;
  const pageDocuments = sortedDocuments.slice(startIdx, startIdx + pageSize);

  const handleDelete = async (id: number) => {
    if (!confirm('ยืนยันการลบเอกสารนี้?')) return;
    try {
      const result = await deleteDocument(id);
      if (result.status === 'success') {
        alert('ลบเอกสารสำเร็จ');
        if (onDocumentDeleted) onDocumentDeleted();
      } else {
        alert('ไม่สามารถลบเอกสารได้: ' + result.message);
      }
    } catch (err: unknown) {
      alert('ไม่สามารถลบเอกสารได้: ' + String(err));
    }
  };

  if (sortedDocuments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gradient-to-br from-slate-100 to-blue-100 rounded-3xl border-2 border-dashed border-blue-700 text-slate-600">
        <div className="bg-slate-200 p-6 rounded-full mb-4 shadow-md">
          <FileText size={64} className="opacity-40 text-slate-600" />
        </div>
        <p className="text-xl font-semibold text-slate-800 font-prompt">ไม่มีเอกสารในหมวดนี้</p>
        <p className="text-sm text-slate-600 mt-2 font-prompt">ยังไม่มีเอกสารที่อัปโหลดในหมวดหมู่นี้</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-3">

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-mid)' }}>
              <th className="px-4 py-3 text-center text-sm font-medium font-prompt w-14" style={{ color: 'var(--text-secondary)' }}>
                ลำดับ
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium font-prompt" style={{ color: 'var(--text-secondary)' }}>
                หัวข้อ
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-left text-sm font-medium font-prompt" style={{ color: 'var(--text-secondary)' }}>
                  คำอธิบาย
                </th>
              )}
              {isAdmin && (
                <th className="px-4 py-3 text-center text-sm font-medium font-prompt" style={{ color: 'var(--text-secondary)' }}>
                  รอบ
                </th>
              )}
              <th className="px-4 py-3 text-center text-sm font-medium font-prompt w-14" style={{ color: 'var(--text-secondary)' }}>
                ไฟล์
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-center text-sm font-medium font-prompt" style={{ color: 'var(--text-secondary)' }}>
                  ผู้อัปโหลด
                </th>
              )}
              {isAdmin && (
                <th className="px-4 py-3 text-center text-sm font-medium font-prompt" style={{ color: 'var(--text-secondary)' }}>
                  จัดการ
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageDocuments.map((doc, idx) => (
              <tr
                key={doc.id}
                className="transition-colors"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {/* ลำดับ — ต่อเนื่องจากหน้าก่อน */}
                <td className="px-4 py-3 text-center">
                  <span
                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                    style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}
                  >
                    {startIdx + idx + 1}
                  </span>
                </td>

                {/* หัวข้อ */}
                <td className="px-4 py-3 w-full">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{ background: 'var(--brand)', color: '#fff', border: '1px solid var(--brand-border)' }}
                    >
                      <FileText size={18} />
                    </div>
                    <span className="font-semibold font-prompt" style={{ color: 'var(--text)' }} title={doc.title}>
                      {doc.title}
                    </span>
                  </div>
                </td>

                {isAdmin && (
                  <td className="px-4 py-3 text-sm text-slate-600 font-prompt truncate max-w-xs" title={doc.description}>
                    {doc.description || '-'}
                  </td>
                )}

                {isAdmin && (
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-400">
                      {doc.quarter || 'N/A'}
                    </span>
                  </td>
                )}

                {/* ไฟล์ */}
                <td className="px-2 py-3 text-center">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={doc.fileName || 'เปิดอ่าน'}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
                    style={{ background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand-border)' }}
                  >
                    <Paperclip size={16} />
                  </a>
                </td>

                {isAdmin && (
                  <td className="px-4 py-3 text-center text-sm text-slate-600 font-prompt">
                    {doc.uploader || '-'}
                  </td>
                )}

                {isAdmin && (
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit?.(doc)}
                        className="p-2 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors border border-blue-300"
                        title="แก้ไข"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                        title="ลบ"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-sm font-prompt" style={{ color: 'var(--text-muted)' }}>
          แสดง{' '}
          <span className="font-bold" style={{ color: 'var(--text)' }}>{startIdx + 1}</span>
          {' '}–{' '}
          <span className="font-bold" style={{ color: 'var(--text)' }}>
            {Math.min(startIdx + pageSize, sortedDocuments.length)}
          </span>
          {' '}จาก{' '}
          <span className="font-bold" style={{ color: 'var(--text)' }}>{sortedDocuments.length}</span>
          {' '}รายการ
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-prompt" style={{ color: 'var(--text-muted)' }}>แสดง</span>
            <div className="flex gap-1">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  onClick={() => setPageSize(size)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-prompt"
                  style={pageSize === size ? {
                    background: 'var(--brand)',
                    color: '#fff',
                    border: '1px solid var(--brand-hover)',
                  } : {
                    background: 'var(--bg-surface)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-prompt disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={14} /> ย้อนกลับ
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className="w-8 h-8 rounded-lg text-xs font-bold transition-all font-prompt"
                      style={currentPage === p ? {
                        background: 'var(--brand)',
                        color: '#fff',
                        border: '1px solid var(--brand-hover)',
                      } : {
                        background: 'var(--bg-surface)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-prompt disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              หน้าถัดไป <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
