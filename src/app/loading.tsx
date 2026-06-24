export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="bg-green-100 p-8 rounded-full mb-6 shadow-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-700"></div>
      </div>
      <p className="text-xl font-semibold text-green-700 font-prompt">กำลังโหลด...</p>
    </div>
  );
}
