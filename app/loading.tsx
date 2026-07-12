export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light">
      <div className="text-center">
        <div className="inline-flex items-center justify-center">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 bg-gradient-to-r from-navy-mid to-navy-light rounded-full animate-spin" />
            <div className="absolute inset-1 bg-bg-light rounded-full" />
          </div>
        </div>
        <p className="mt-6 text-navy-mid font-semibold">Đang tải...</p>
      </div>
    </div>
  );
}
