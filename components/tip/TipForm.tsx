"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Loader2, Sparkles } from "lucide-react";
import AmountSelector from "./AmountSelector";
import type { RazorpayCheckoutResponse } from "@/lib/razorpay-checkout";
import type { TipOrderResponse } from "@/lib/types";

interface TipFormProps {
  username: string;
}

const MESSAGE_MAX = 50;

export default function TipForm({ username }: TipFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState(100);
  const [scriptReady, setScriptReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Clear the success banner if the donor decides to send another tip
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 5000);
      return () => clearTimeout(t);
    }
  }, [success]);

  async function handleSendTip() {
    setError(null);

    if (!name.trim()) return setError("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Please enter a valid email for your receipt.");
    if (amount < 10) return setError("Minimum tip amount is ₹10.");
    if (!scriptReady) return setError("Payment gateway is still loading, try again in a second.");

    setSubmitting(true);
    try {
      // 1. Create a Razorpay order on the server
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, name, email, message, username }),
      });
      const order: TipOrderResponse & { error?: string } = await orderRes.json();

      if (!orderRes.ok || !order.order_id) {
        throw new Error(order.error ?? "Could not start the payment.");
      }

      // 2. Open Razorpay Checkout
      const razorpay = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Tipzo",
        description: `Tip for @${username}`,
        order_id: order.order_id,
        prefill: { name, email },
        theme: { color: "#06b6d4" },
        notes: { message },
        handler: async (response: RazorpayCheckoutResponse) => {
          // 3. Verify signature server-side, then broadcast to the overlay
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                name,
                message,
                amount,
                username,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error ?? "Payment verification failed.");
            }
            setSuccess(true);
            setMessage("");
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Payment verification failed."
            );
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      razorpay.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setSubmitting(false);
      });

      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
        strategy="afterInteractive"
      />

      <div className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Aarav Sharma"
            className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              Alert Message
            </label>
            <span
              className={`text-xs ${
                message.length >= MESSAGE_MAX ? "text-amber-400" : "text-slate-500"
              }`}
            >
              {message.length}/{MESSAGE_MAX}
            </span>
          </div>
          <textarea
            value={message}
            maxLength={MESSAGE_MAX}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Say something nice on stream!"
            rows={3}
            className="w-full resize-none rounded-xl border border-surface-border bg-surface px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
        </div>

        <AmountSelector amount={amount} onChange={setAmount} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-surface-border bg-surface px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
          />
          <p className="mt-1 text-xs text-slate-500">
            We&apos;ll send your payment receipt here.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
            <Sparkles className="h-4 w-4" />
            Tip sent! It should pop up on stream any second now.
          </div>
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={handleSendTip}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-dark py-4 text-base font-bold text-slate-950 shadow-glow transition hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>Send Tip • ₹{amount.toLocaleString("en-IN")}</>
          )}
        </button>
      </div>
    </>
  );
}
