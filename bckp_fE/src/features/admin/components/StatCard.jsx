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
        rounded-3xl
        border
        border-zinc-200
        bg-gradient-to-br
        from-white
        to-zinc-50
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >
      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm uppercase tracking-widest text-zinc-500">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-black">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-zinc-500">
              {subtitle}
            </p>
          )}

        </div>

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-black
            text-white
            transition-transform
            duration-300
            group-hover:rotate-6
          "
        >
          <Icon size={26} />
        </div>

      </div>

      <div
        className="
          absolute
          -right-8
          -top-8
          h-28
          w-28
          rounded-full
          bg-zinc-100
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      <ArrowUpRight
        size={18}
        className="
          absolute
          bottom-5
          right-5
          text-zinc-300
          opacity-0
          transition-all
          group-hover:translate-x-1
          group-hover:-translate-y-1
          group-hover:opacity-100
        "
      />
    </div>
  );
}