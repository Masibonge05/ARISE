/**
 * src/components/ui/Modal.jsx
 * Reusable Modal and ConfirmDialog components for ARISE.
 *
 * Usage:
 *   import { Modal, ConfirmDialog, useModal } from "../components/ui/Modal";
 *
 *   // Modal
 *   <Modal open={open} onClose={() => setOpen(false)} title="Edit Profile">
 *     <p>Content here</p>
 *   </Modal>
 *
 *   // Confirm
 *   <ConfirmDialog
 *     open={confirming}
 *     title="Delete listing?"
 *     message="This cannot be undone."
 *     onConfirm={handleDelete}
 *     onCancel={() => setConfirming(false)}
 *     danger
 *   />
 */

import { useEffect, useCallback, useState } from "react";

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 480,
  showClose = true,
  noPad = false,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes modalFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes modalSlideUp { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          animation: "modalFadeIn 0.2s ease",
        }}
      />
      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          width: "90%",
          maxWidth,
          maxHeight: "90vh",
          background: "#141420",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 18,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "modalSlideUp 0.25s ease",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {/* Header */}
        {(title || showClose) && (
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}>
            {title && (
              <h3 style={{ fontWeight: 800, fontSize: 17, color: "#E8E8F0", margin: 0 }}>
                {title}
              </h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#888",
                  borderRadius: "50%",
                  width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 16,
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >×</button>
            )}
          </div>
        )}
        {/* Content */}
        <div style={{ padding: noPad ? 0 : "20px 24px 24px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
    </>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} maxWidth={380} showClose={false}>
      {message && (
        <p style={{ fontSize: 14, color: "#AAA", lineHeight: 1.6, marginBottom: 20 }}>
          {message}
        </p>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#888", borderRadius: 8, padding: "12px",
            fontSize: 14, cursor: "pointer", fontFamily: "Sora,sans-serif",
          }}
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            flex: 2,
            background: danger ? "rgba(255,68,68,0.15)" : "#FF6B35",
            border: `1px solid ${danger ? "rgba(255,68,68,0.35)" : "transparent"}`,
            color: danger ? "#FF6666" : "#fff",
            borderRadius: 8, padding: "12px",
            fontSize: 14, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Sora,sans-serif",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Please wait…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

// ── useModal hook ─────────────────────────────────────────────────────────────
export function useModal(initial = false) {
  const [open, setOpen] = useState(initial);
  const [data, setData]   = useState(null);

  const show = useCallback((payload = null) => {
    setData(payload);
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    setTimeout(() => setData(null), 300); // clear after animation
  }, []);

  return { open, data, show, hide };
}

export default Modal;