"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import {
  primaryButtonClassName,
  secondaryButtonClassName,
} from "@/components/PageContainer";

export type ConfirmRequest = {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "default" | "danger";
};

const dangerButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-lg bg-red-700 px-5 text-sm font-medium text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  tone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    cancelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-medium text-zinc-900">
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-600">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className={secondaryButtonClassName}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              tone === "danger" ? dangerButtonClassName : primaryButtonClassName
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirmDialog() {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setRequest(null);
  }, []);

  const confirm = useCallback((next: ConfirmRequest) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setRequest(next);
    });
  }, []);

  const onCancel = useCallback(() => settle(false), [settle]);
  const onConfirm = useCallback(() => settle(true), [settle]);

  const dialog = (
    <ConfirmDialog
      open={request != null}
      title={request?.title ?? ""}
      message={request?.message ?? ""}
      confirmLabel={request?.confirmLabel ?? "Confirm"}
      tone={request?.tone ?? "default"}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );

  return { confirm, dialog };
}
