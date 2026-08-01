import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-base px-4 text-center">
      <h1 className="text-3xl font-extrabold text-white">
        Tipzo
        <span className="text-accent">.</span>
      </h1>
      <p className="max-w-sm text-slate-400">
        Try the tipping page at{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 text-accent-light">
          /tip/your-username
        </code>{" "}
        and the OBS overlay at{" "}
        <code className="rounded bg-surface px-1.5 py-0.5 text-accent-light">
          /alert-box?username=your-username
        </code>
        .
      </p>
      <Link
        href="/tip/demo-creator"
        className="rounded-xl bg-gradient-to-r from-accent to-accent-dark px-6 py-3 font-bold text-slate-950 shadow-glow transition hover:shadow-glow-lg"
      >
        View demo tip page
      </Link>
    </main>
  );
}
