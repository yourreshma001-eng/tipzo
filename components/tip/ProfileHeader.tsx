import { Youtube } from "lucide-react";

interface ProfileHeaderProps {
  username: string;
}

export default function ProfileHeader({ username }: ProfileHeaderProps) {
  const displayName = username
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3 pt-8 pb-6">
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-xl font-bold text-slate-950 shadow-glow ring-2 ring-accent/40">
          {initials}
        </div>
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-surface ring-2 ring-base">
          <Youtube className="h-4 w-4 text-red-500" strokeWidth={2.2} />
        </span>
      </div>

      <div className="text-center">
        <h1 className="text-lg font-semibold text-white">{displayName}</h1>
        <p className="text-sm text-slate-400">@{username}</p>
      </div>
    </div>
  );
}
