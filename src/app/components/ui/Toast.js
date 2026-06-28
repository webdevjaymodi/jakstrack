"use client";

import { useState, useCallback, useEffect } from "react";

const toastStyles = {
  success: {
    bg: "bg-emerald-500/15 border-emerald-500/30",
    text: "text-emerald-400",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  error: {
    bg: "bg-red-500/15 border-red-500/30",
    text: "text-red-400",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  info: {
    bg: "bg-cyan-500/15 border-cyan-500/30",
    text: "text-cyan-400",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), 4000)
    );

    return () => timers.forEach(clearTimeout);
  }, [toasts, removeToast]);

  return { toasts, addToast, removeToast };
}

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const style = toastStyles[toast.type] || toastStyles.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg shadow-black/20 min-w-[300px] max-w-[420px] animate-slide-in-right ${style.bg}`}
          >
            <span className={style.text}>{style.icon}</span>
            <p className={`text-sm font-medium flex-1 ${style.text}`}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-md hover:bg-white/10 transition-all cursor-pointer ${style.text}`}
              aria-label="Dismiss toast"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
