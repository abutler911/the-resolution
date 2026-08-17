/**
 * Shared plumbing for the practice charts.
 *
 * Charts here are hand-rolled SVG — no charting dependency — so these pieces
 * carry the conventions that keep them consistent: a measured responsive
 * frame, a recessive grid, a hover tooltip layer, a legend, and a table view
 * so every chart's numbers are readable without relying on colour.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Ink and grid tokens, matched to the app's dark studio surface. */
export const CHART = {
  grid: "rgba(255,255,255,0.07)",
  axis: "rgba(255,255,255,0.14)",
  textMuted: "#8b8b9c",
  surface: "#12121f",
} as const;

/** Measure the container so the SVG can be laid out in real pixels. */
export function useElementWidth<T extends HTMLElement>(fallback = 640) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => setWidth(element.clientWidth || fallback);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fallback]);

  return [ref, width] as const;
}

export interface TooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

/**
 * Chart shell: title, optional legend and table toggle, the plot itself, and
 * the floating tooltip. Keeping this in one place means every chart gets the
 * same affordances rather than each one inventing its own.
 */
export function ChartFrame({
  title,
  subtitle,
  legend,
  tooltip,
  table,
  children,
  containerRef,
}: {
  title: string;
  subtitle?: string;
  legend?: ReactNode;
  tooltip: TooltipState | null;
  table?: ReactNode;
  children: ReactNode;
  containerRef: React.Ref<HTMLDivElement>;
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section className="card">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>}
        </div>
        {table && (
          <button
            type="button"
            onClick={() => setShowTable((value) => !value)}
            className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-400 transition hover:text-zinc-100"
            aria-expanded={showTable}
          >
            {showTable ? "Show chart" : "Show table"}
          </button>
        )}
      </div>

      {legend && <div className="mb-3">{legend}</div>}

      {showTable && table ? (
        <div className="overflow-x-auto">{table}</div>
      ) : (
        <div ref={containerRef} className="relative w-full">
          {children}
          {tooltip && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl border border-white/15 bg-ink-900/95 px-3 py-2 text-xs shadow-card backdrop-blur"
              style={{ left: tooltip.x, top: tooltip.y - 10 }}
              role="status"
            >
              {tooltip.content}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** Colour swatch + label. Identity is never carried by the mark colour alone. */
export function Legend({
  items,
}: {
  items: Array<{ label: string; color: string; value?: string }>;
}) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-zinc-300">{item.label}</span>
          {item.value && <span className="text-zinc-500">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}

export function ChartTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-500">
          {headers.map((header, i) => (
            <th key={header} className={`py-2 pr-4 font-medium ${i > 0 ? "text-right" : ""}`}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="border-b border-white/5 last:border-0">
            {row.map((cell, i) => (
              <td
                key={i}
                className={`py-2 pr-4 ${i > 0 ? "text-right font-mono text-zinc-300" : "text-zinc-200"}`}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Tooltip state that clears itself when the pointer leaves the plot. */
export function useTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const clear = useCallback(() => setTooltip(null), []);

  useEffect(() => {
    if (!tooltip) return;
    // A tooltip left behind by a scroll or a tap elsewhere is worse than none.
    window.addEventListener("scroll", clear, { passive: true });
    return () => window.removeEventListener("scroll", clear);
  }, [tooltip, clear]);

  return { tooltip, setTooltip, clear };
}

export function TooltipBody({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: string; color?: string }>;
}) {
  return (
    <div className="min-w-[8rem] space-y-1">
      <p className="font-medium text-zinc-100">{title}</p>
      {rows.map((row) => (
        <p key={row.label} className="flex items-center justify-between gap-3 text-zinc-400">
          <span className="flex items-center gap-1.5">
            {row.color && (
              <span
                aria-hidden
                className="h-2 w-2 rounded-[2px]"
                style={{ backgroundColor: row.color }}
              />
            )}
            {row.label}
          </span>
          <span className="font-mono text-zinc-200">{row.value}</span>
        </p>
      ))}
    </div>
  );
}

/** "Nice" axis maximum so gridlines land on round numbers. */
export function niceMax(value: number, ticks = 4): number {
  if (value <= 0) return ticks;
  const rough = value / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= rough) ?? 10;
  return step * magnitude * ticks;
}
