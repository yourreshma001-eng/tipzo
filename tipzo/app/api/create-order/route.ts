import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import type { TipOrderRequest, TipOrderResponse } from "@/lib/types";

const MIN_AMOUNT = 10; // rupees
const MAX_AMOUNT = 100000; // rupees, sanity ceiling — adjust to your needs

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<TipOrderRequest>;
    const { amount, name, message, email, username } = body;

    // --- basic server-side validation, never trust the client amount blindly ---
    if (!amount || typeof amount !== "number" || Number.isNaN(amount)) {
      return NextResponse.json(
        { error: "A valid tip amount is required." },
        { status: 400 }
      );
    }
    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      return NextResponse.json(
        { error: `Amount must be between ₹${MIN_AMOUNT} and ₹${MAX_AMOUNT}.` },
        { status: 400 }
      );
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "A valid email is required for the receipt." },
        { status: 400 }
      );
    }
    if (!username) {
      return NextResponse.json(
        { error: "Missing creator username." },
        { status: 400 }
      );
    }
    if (message && message.length > 50) {
      return NextResponse.json(
        { error: "Message must be 50 characters or fewer." },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(amount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      // Razorpay receipt IDs are capped at 40 chars
      receipt: `tip_${username}_${Date.now()}`.slice(0, 40),
      notes: {
        donor_name: name,
        donor_email: email,
        message: message ?? "",
        creator_username: username,
      },
    });

    const response: TipOrderResponse = {
      order_id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID as string,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("[create-order] failed:", err);
    return NextResponse.json(
      { error: "Could not create the payment order. Please try again." },
      { status: 500 }
    );
  }
}
