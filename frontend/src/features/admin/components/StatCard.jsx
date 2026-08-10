import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}) {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        rounded-2xl sm:rounded-3xl
        border
        border-zinc-200
        bg-gradient-to-br
        from-white
        to-zinc-50
        p-4 sm:p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      <div className="flex items-start justify-between gap-2">

        <div className="min-w-0 flex-1">

          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-zinc-500 truncate">
            {title}
          </p>

          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black break-words">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              {subtitle}
            </p>
          )}

        </div>

        <div
          className="
            flex
            h-10
            w-10
            sm:h-14
            sm:w-14
            shrink-0
            items-center
            justify-center
            rounded-xl
            sm:rounded-2xl
            bg-black
            text-white
            transition-transform
            duration-300
            group-hover:rotate-6
          "
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

      </div>
    </div>
  );
}