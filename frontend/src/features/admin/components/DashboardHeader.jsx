import { CalendarDays } from "lucide-react";

export default function DashboardHeader() {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">
          Admin Panel
        </p>

        <h1 className="mt-2 text-5xl font-black tracking-tight">
          Dashboard
        </h1>

        <p className="mt-3 max-w-xl text-zinc-500">
          Welcome back. Here's what's happening in your store today.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 shadow-sm">
        <CalendarDays
          size={22}
          className="text-zinc-600"
        />

        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">
            Today
          </p>

          <p className="font-semibold">
            {today}
          </p>
        </div>
      </div>
    </div>
  );
}