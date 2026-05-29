export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-5 h-5 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Spinner className="w-6 h-6" />
    </div>
  );
}
