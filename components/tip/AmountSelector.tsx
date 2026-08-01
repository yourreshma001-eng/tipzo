"use client";

import { Minus, Plus } from "lucide-react";

interface AmountSelectorProps {
  amount: number;
  onChange: (amount: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const QUICK_AMOUNTS: { label: string; value: number }[] = [
  { label: "₹40", value: 40 },
  { label: "₹100", value: 100 },
  { label: "₹500", value: 500 },
  { label: "₹1k", value: 1000 },
  { label: "₹2k", value: 2000 },
  { label: "₹10k", value: 10000 },
];

export default function AmountSelector({
  amount,
  onChange,
  min = 10,
  max = 100000,
  step = 10,
}: AmountSelectorProps) {
  function clamp(value: number) {
    return Math.min(max, Math.max(min, value));
  }

  function handleManualInput(raw: string) {
    const parsed = Number(raw.replace(/[^0-9]/g, ""));
    if (Number.isNaN(parsed)) {
      onChange(min);
      return;
    }
    onChange(parsed);
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-300">Tip Amount</label>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          aria-label="Decrease amount"
          onClick={() => onChange(clamp(amount - step))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-surface-border bg-surface text-slate-300 transition hover:border-accent/60 hover:text-accent active:scale-95"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-accent">
            ₹
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => handleManualInput(e.target.value)}
            onBlur={() => onChange(clamp(amount))}
            className="w-full rounded-xl border border-surface-border bg-surface py-3 pl-9 pr-3 text-center text-xl font-bold text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <button
          type="button"
          aria-label="Increase amount"
          onClick={() => onChange(clamp(amount + step))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-surface-border bg-surface text-slate-300 transition hover:border-accent/60 hover:text-accent active:scale-95"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        {QUICK_AMOUNTS.map((q) => {
          const active = amount === q.value;
          return (
            <button
              key={q.value}
              type="button"
              onClick={() => onChange(q.value)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition active:scale-95 ${
                active
                  ? "border-accent bg-accent/15 text-accent shadow-glow"
                  : "border-surface-border bg-surface text-slate-300 hover:border-accent/50 hover:text-accent"
              }`}
            >
              {q.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
