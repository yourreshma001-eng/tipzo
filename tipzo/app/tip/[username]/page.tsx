import ProfileHeader from "@/components/tip/ProfileHeader";
import TipForm from "@/components/tip/TipForm";

interface TipPageProps {
  params: { username: string };
}

export function generateMetadata({ params }: TipPageProps) {
  return {
    title: `Tip @${params.username} — Tipzo`,
    description: `Send a tip and message to @${params.username}, live on stream.`,
  };
}

export default function TipPage({ params }: TipPageProps) {
  const { username } = params;

  return (
    <main className="relative min-h-screen overflow-hidden bg-base">
      {/* ambient glow background */}
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-10">
        <ProfileHeader username={username} />

        <div className="rounded-2xl border border-surface-border bg-surface/60 p-6 shadow-card backdrop-blur-xl">
          <TipForm username={username} />
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Payments secured by Razorpay. Tipzo does not store your card details.
        </p>
      </div>
    </main>
  );
}
