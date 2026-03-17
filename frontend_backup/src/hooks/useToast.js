/**
 * src/hooks/useToast.js
 * Global toast notification system for ARISE.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success("Application submitted!");
 *   toast.error("Something went wrong.");
 *   toast.ecs(25, "Skill assessed!");
 *   toast.info("Profile updated.");
 */

import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";

// ─── Toast Context ────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

let _toastId = 0;

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = "info", duration = 4000) => {
    const id = ++_toastId;

    setToasts((t) => [
      ...t,
      {
        id,
        message,
        type,
        duration,
      },
    ]);

    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => add(msg, "success", dur),
    error: (msg, dur) => add(msg, "error", dur || 6000),
    info: (msg, dur) => add(msg, "info", dur),
    warning: (msg, dur) => add(msg, "warning", dur),
    ecs: (pts, msg) => add(`+${pts} ECS — ${msg}`, "ecs", 5000),
    remove,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);

  // If provider is missing, return safe fallback instead of crashing
  if (!ctx) {
    console.warn("ToastProvider not found. Toast disabled.");

    return {
      success: (msg) => console.log("Toast success:", msg),
      error: (msg) => console.error("Toast error:", msg),
      info: (msg) => console.info("Toast info:", msg),
      warning: (msg) => console.warn("Toast warning:", msg),
      ecs: (pts, msg) => console.log(`ECS +${pts}:`, msg),
      remove: () => {},
    };
  }

  return ctx;
}

// ─── Toast Container ──────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        fontFamily: "'Sora', sans-serif",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateX(100%); }
          to { opacity:1; transform:translateX(0); }
        }
      `}</style>

      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}

// ─── Individual Toast ─────────────────────────────────────────────────────────
function Toast({ toast, onRemove }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration);

    return () => clearTimeout(timerRef.current);
  }, [toast.id, toast.duration, onRemove]);

  const configs = {
    success: {
      border: "rgba(78,205,196,0.3)",
      icon: "✅",
      color: "#4ECDC4",
    },
    error: {
      border: "rgba(255,68,68,0.3)",
      icon: "❌",
      color: "#FF6B35",
    },
    warning: {
      border: "rgba(255,215,61,0.3)",
      icon: "⚠️",
      color: "#FFD93D",
    },
    info: {
      border: "rgba(255,255,255,0.15)",
      icon: "ℹ️",
      color: "#E8E8F0",
    },
    ecs: {
      border: "rgba(255,107,53,0.3)",
      icon: "⭐",
      color: "#FF6B35",
    },
  };

  const c = configs[toast.type] || configs.info;

  return (
    <div
      onClick={() => onRemove(toast.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "#141420",
        border: `1px solid ${c.border}`,
        borderLeft: `3px solid ${c.color}`,
        borderRadius: 10,
        padding: "13px 16px",
        minWidth: 280,
        maxWidth: 380,
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        animation: "slideIn 0.25s ease",
      }}
    >
      <span style={{ fontSize: 18 }}>{c.icon}</span>

      <span
        style={{
          fontSize: 13,
          color: "#E8E8F0",
          flex: 1,
          lineHeight: 1.4,
        }}
      >
        {toast.message}
      </span>

      <span style={{ fontSize: 16, color: "#555" }}>×</span>
    </div>
  );
}