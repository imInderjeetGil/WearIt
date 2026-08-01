export default function SectionCard({
  title,
  action,
  children,
}) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-zinc-200
        bg-white
        p-6
        shadow-sm
      "
    >
      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-xl font-bold">
          {title}
        </h2>

        {action}

      </div>

      {children}

    </section>
  );
}