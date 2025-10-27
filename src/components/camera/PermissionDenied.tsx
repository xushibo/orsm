'use client';

interface PermissionDeniedProps {
  error?: string | null;
  onRetry: () => void;
}

export function PermissionDenied({ error, onRetry }: PermissionDeniedProps) {
  return (
    <div className="absolute inset-0 bg-red-900 flex items-center justify-center p-4">
      <div className="text-center text-white">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold mb-2">Camera Access Denied</h2>
        <p className="mb-6">{error || 'Please allow camera access in your browser settings'}</p>
        <button
          onClick={onRetry}
          className="bg-white text-red-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
