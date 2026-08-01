import { NextRequest, NextResponse } from "next/server";
import { pusherServer, alertChannelName, NEW_TIP_EVENT } from "@/lib/pusher-server";
import type { TipAlertPayload } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, message, amount, username } = body;

    if (!username) {
      return NextResponse.json(
        { error: "Missing username." },
        { status: 400 }
      );
    }

    const alertPayload: TipAlertPayload = {
      id: `test_${Date.now()}`,
      name: (name && String(name).trim()) || "Test Donor",
      message: (message ?? "This is a test alert! 🎉").slice(0, 50),
      amount: Number(amount) || 100,
      createdAt: new Date().toISOString(),
    };

    await pusherServer.trigger(
      alertChannelName(username),
      NEW_TIP_EVENT,
      alertPayload
    );

    return NextResponse.json({ success: true, alert: alertPayload });
  } catch (err) {
    console.error("[test-alert] failed:", err);
    return NextResponse.json(
      { error: "Could not send test alert." },
      { status: 500 }
    );
  }
}
