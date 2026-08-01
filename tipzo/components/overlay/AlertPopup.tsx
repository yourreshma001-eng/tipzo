"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import type { TipAlertPayload } from "@/lib/types";

interface AlertPopupProps {
  alert: TipAlertPayload | null;
}

export default function AlertPopup({ alert }: AlertPopupProps) {
  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, y: -60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="flex w-[420px] flex-col items-center gap-3 rounded-2xl border border-accent/40 bg-surface/95 px-8 py-6 text-center shadow-glow-lg backdrop-blur-md"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -8, 0] }}
            transition={{ duration: 0.9, repeat: 1, repeatDelay: 1.2 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark shadow-glow"
          >
            <PartyPopper className="h-7 w-7 text-slate-950" />
          </motion.div>

          <div>
            <p className="text-2xl font-extrabold text-white drop-shadow">
              {alert.name}
            </p>
            <p className="text-lg font-bold text-accent-light">
              tipped ₹{alert.amount.toLocaleString("en-IN")}
            </p>
          </div>

          {alert.message && (
            <p className="max-w-[340px] text-base font-medium leading-snug text-slate-200">
              &ldquo;{alert.message}&rdquo;
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
