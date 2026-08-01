import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pusherServer, alertChannelName, NEW_TIP_EVENT } from "@/lib/pusher-server";
import type { VerifyPaymentRequest, TipAlertPayload } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<VerifyPaymentRequest>;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      message,
      amount,
      username,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !username ||
      !amount
    ) {
      return NextResponse.json(
        { success: false, error: "Missing verification fields." },
        { status: 400 }
      );
    }

    // --- HMAC SHA256 signature verification ---
    // Razorpay signs `order_id|payment_id` with your key secret. We
    // recompute the same signature server-side and compare it against
    // what the client received back from the checkout modal.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(razorpay_signature, "utf-8")
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    // At this point the payment is confirmed genuine.
    // TODO: persist the tip to your database here (Postgres/Mongo/etc.)
    // before broadcasting, so the alert-box has a durable source of truth.

    const alertPayload: TipAlertPayload = {
      id: razorpay_payment_id,
      name: (name && name.trim()) || "Anonymous",
      message: (message ?? "").slice(0, 50),
      amount,
      createdAt: new Date().toISOString(),
    };

    await pusherServer.trigger(
      alertChannelName(username),
      NEW_TIP_EVENT,
      alertPayload
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("[verify-payment] failed:", err);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please contact support." },
      { status: 500 }
    );
  }
}
