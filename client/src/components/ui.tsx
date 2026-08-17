// Small shared building blocks for the practice screens.
// Everything here leans on the component classes in index.css so the studio
// look stays in one place.

import { useEffect, useId, useRef, type ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatTile({
  label,
  value,
  unit,
  caption,
  accent = false,
}: {
  label: string;
  value: string | number;
  unit?: string;
  caption?: string;
  accent?: boolean;
}) {
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold leading-none">
        <span className={accent ? "gradient-text" : undefined}>{value}</span>
        {unit && <span className="ml-1 text-base font-medium text-zinc-400">{unit}</span>}
      </p>
      {caption && <p className="mt-1.5 text-xs text-zinc-500">{caption}</p>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center py-10 text-center">
      {icon && (
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-zinc-400">
          {icon}
        </div>
      )}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-zinc-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            value === option.value
              ? "bg-white/15 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * 1–5 self-rating. Rendered as buttons rather than stars so the numbers stay
 * legible and the control is keyboard-reachable; the value is always spelled
 * out in text beside it, never carried by colour alone.
 */
export function Rating({
  value,
  onChange,
  labels = ["Rough", "Shaky", "OK", "Good", "Great"],
  allowClear = true,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  labels?: string[];
  allowClear?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            aria-pressed={active}
            aria-label={`${n} — ${labels[n - 1]}`}
            onClick={() => onChange(allowClear && active ? null : n)}
            className={`h-9 w-9 rounded-lg border text-sm font-semibold transition ${
              active
                ? "border-tension bg-tension/25 text-white"
                : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-zinc-100"
            }`}
          >
            {n}
          </button>
        );
      })}
      <span className="ml-1 text-xs text-zinc-500">
        {value ? labels[value - 1] : "Not rated"}
      </span>
    </div>
  );
}

/**
 * Modal dialog: focus moves in on open, Escape and backdrop clicks close it,
 * and body scroll is locked while it's up.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Callers pass `onClose` as an inline arrow, so its identity changes on every
  // render. Kept in a ref, the Escape listener below can depend on `open` alone
  // — depending on the callback re-ran this effect on every keystroke, and the
  // focus() call inside it pulled focus out of whatever field was being typed
  // into (which closes the keyboard on mobile).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Move focus into the dialog once, when it opens — but never steal it from a
  // field that already has it, so an autofocused input keeps the caret.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) panel.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-ink-800 p-5 shadow-card outline-none sm:rounded-2xl sm:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 py-8 text-sm text-zinc-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-tension" />
      {label}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200"
    >
      {message}
    </p>
  );
}
