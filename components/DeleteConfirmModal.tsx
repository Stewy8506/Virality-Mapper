"use client";

import { useEffect, useRef } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ isOpen, title, message, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    confirmRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal-content">
        <h3 id="delete-modal-title" style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 600 }}>{title}</h3>
        <p style={{ margin: "0 0 20px", fontSize: "0.875rem", color: "var(--zinc-400)" }}>{message}</p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onCancel} className="btn-secondary" aria-label="Cancel deletion">Cancel</button>
          <button ref={confirmRef} type="button" onClick={onConfirm} className="btn-danger" aria-label="Confirm deletion">Delete</button>
        </div>
      </div>
    </div>
  );
}
