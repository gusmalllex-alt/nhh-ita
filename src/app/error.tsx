'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full border-2 border-red-200 text-center">
        <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-red-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-red-800 mb-4 font-prompt">
          เกิดข้อผิดพลาด
        </h2>
        
        <p className="text-red-600 mb-8 font-prompt">
          ขออภัย ระบบเกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
        </p>

        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-900/25 transition-all active:scale-95 font-prompt"
        >
          <RefreshCw size={18} />
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
}
