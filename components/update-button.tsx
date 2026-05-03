"use client";

import { RefreshCw, Badge } from "lucide-react";
import { usePWAUpdate } from "@/hooks/use-pwa-update";

export function UpdateButton() {
  const { hasUpdate, dismissUpdate } = usePWAUpdate();

  if (!hasUpdate) return null;

  const handleUpdate = () => {
    window.location.reload();
  };

  return (
    <button
      onClick={handleUpdate}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full shadow-lg transition-all duration-200 active:scale-95"
      aria-label="Update available"
    >
      <div className="relative">
        <RefreshCw className="w-5 h-5 animate-spin-slow" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-green-600" />
      </div>
      <span className="font-medium text-sm">Update</span>
    </button>
  );
}