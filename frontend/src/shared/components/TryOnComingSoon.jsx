import { Sparkles } from "lucide-react";

// Intentional "coming soon" marketing piece — NOT an error state. No AI
// generation is triggered anywhere from this UI.
export default function TryOnComingSoon({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
          <Sparkles size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900">
            AI Try-On — coming soon
          </p>
          <p className="text-xs text-zinc-500">
            See how your outfit could look on you, right here.
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          Coming Soon
        </span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-700 p-6 text-white sm:p-8">
      <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-4 h-32 w-32 rounded-full bg-white/5" />

      <div className="relative flex flex-wrap items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <Sparkles size={22} />
        </span>

        <div className="flex-1 min-w-[220px]">
          <p className="text-lg font-bold">✨ AI Try-On</p>
          <p className="mt-1 text-sm text-zinc-300">
            See how your selected outfit could look on you — virtual try-on is
            on its way.
          </p>
        </div>

        <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-zinc-900">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
