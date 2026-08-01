# Tipzo

A Tipzo-style tip/donation app: a donor-facing tipping page and a transparent
OBS overlay that pops up a live alert the instant a tip is paid.

- **Tipping page:** `/tip/[username]`
- **OBS overlay:** `/alert-box?username=[username]`

---

## 1. Stack

- Next.js 14 (App Router, Route Handlers)
- React 18 + Tailwind CSS
- Razorpay Checkout + `razorpay` server SDK
- Pusher Channels (`pusher` server SDK + `pusher-js` client) for real-time
  delivery to the overlay
- Framer Motion for the alert pop-in/out animation
- lucide-react for icons

---

## 2. Setup

### Install dependencies

```bash
npx create-next-app@latest tipzo --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd tipzo
npm install razorpay framer-motion lucide-react pusher pusher-js
```

> If you're starting from the files in this project directly, just run:
> ```bash
> npm install
> ```

### Environment variables

Copy the example file and fill in your real keys:

```bash
cp .env.local.example .env.local
```

```bash
# Razorpay — https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Pusher — https://dashboard.pusher.com (Channels app)
PUSHER_APP_ID=1234567
PUSHER_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PUSHER_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

Notes:
- `RAZORPAY_KEY_SECRET` and `PUSHER_SECRET` / `PUSHER_APP_ID` are server-only
  and are never sent to the browser.
- `NEXT_PUBLIC_PUSHER_KEY` and `NEXT_PUBLIC_PUSHER_CLUSTER` are intentionally
  public — the Pusher app key is meant to be visible client-side so the
  browser can open a socket. Access control happens via HMAC-signed private
  channels if you later need to lock things down; this project uses public
  per-creator channels (`alerts-<username>`) since alert data isn't
  sensitive.

### Add your alert sound

Drop an MP3 at `public/alert-sound.mp3` — the overlay plays it automatically
when a tip comes in. Keep it short (1–3s) so it doesn't overlap the next tip.

### Run it

```bash
npm run dev
```

- Tip page: `http://localhost:3000/tip/demo-creator`
- Overlay: `http://localhost:3000/alert-box?username=demo-creator`

Open both in separate tabs, send a test tip (use Razorpay test mode +
[test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/)),
and watch the alert pop up on the overlay tab.

---

## 3. Using the overlay in OBS

1. In OBS, add a **Browser Source**.
2. URL: `https://yourdomain.com/alert-box?username=your-username`
3. Width/height: `500 x 300` (adjust to taste — the popup is centered and
   top-aligned).
4. Check **"Shutdown source when not visible"** OFF, and **"Refresh browser
   when scene becomes active"** OFF, so it keeps listening between alerts.
5. The page background is transparent, so no green-screen chroma key needed.

---

## 4. Architecture

```
donor fills form on /tip/[username]
        │
        ▼
POST /api/create-order  ──▶  Razorpay: orders.create()  ──▶ { order_id }
        │
        ▼
Razorpay Checkout modal opens client-side (checkout.js)
        │
        ▼  (on successful payment)
POST /api/verify-payment
        │  1. recompute HMAC SHA256(order_id|payment_id) with key secret
        │  2. crypto.timingSafeEqual() against razorpay_signature
        │  3. if valid → pusherServer.trigger("alerts-<username>", "new-tip", payload)
        ▼
Pusher Channels broadcasts the event
        │
        ▼
/alert-box (subscribed to "alerts-<username>") receives "new-tip"
        │
        ▼
Framer Motion pop-in → plays audio → auto-hides after 6s
```

### Files

| File | Purpose |
|---|---|
| `app/tip/[username]/page.tsx` | Tipping page shell (server component) |
| `components/tip/TipForm.tsx` | Client form: amount, message, Razorpay checkout flow |
| `components/tip/AmountSelector.tsx` | +/- stepper + quick-select pills |
| `components/tip/ProfileHeader.tsx` | Avatar, handle, platform badge |
| `app/alert-box/page.tsx` | OBS overlay: subscribes to Pusher, queues + shows alerts |
| `components/overlay/AlertPopup.tsx` | Framer Motion alert card |
| `app/api/create-order/route.ts` | Creates a Razorpay order (amount validated server-side) |
| `app/api/verify-payment/route.ts` | Verifies HMAC signature, broadcasts via Pusher |
| `lib/razorpay.ts` | Server Razorpay SDK instance |
| `lib/pusher-server.ts` | Server Pusher SDK instance |
| `lib/pusher-client.ts` | Client Pusher singleton |
| `lib/pusher-shared.ts` | Channel-name/event-name constants shared by both |
| `lib/types.ts` | Shared TypeScript types for order/verify/alert payloads |

---

## 5. Production notes

- **Persist tips to a database.** The current `verify-payment` route
  broadcasts immediately after signature verification but doesn't persist
  anything — add a database write (Postgres/Supabase/Mongo) before the
  `pusherServer.trigger(...)` call so you have a durable record and can
  rebuild history, show a leaderboard, resend receipts, etc.
- **Webhook as a safety net.** The flow above verifies payment via the
  client-returned signature, which covers the common case. For full
  reliability (e.g. the donor closes the tab right after paying), also
  register a Razorpay webhook (`payment.captured`) pointing at a route that
  performs the same HMAC check using `X-Razorpay-Signature` and your
  **webhook secret** (different from the key secret), then triggers the same
  Pusher event — so the alert fires even if the client never calls
  `/api/verify-payment`.
- **Rate limiting.** Add rate limiting to `/api/create-order` to prevent
  abuse (e.g. via Upstash Ratelimit or a simple IP-based check).
- **Currency/amount limits.** Adjust `MIN_AMOUNT` / `MAX_AMOUNT` in
  `app/api/create-order/route.ts` to your needs.
