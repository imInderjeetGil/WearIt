export default function SectionHeading({
  subtitle,
  title,
}) {
  return (
    <div className="mb-10">

      <p className="mb-2 text-xs uppercase tracking-[0.35em] text-zinc-500">
        {subtitle}
      </p>

      <h2 className="text-3xl font-black lg:text-5xl">
        {title}
      </h2>

    </div>
  );
}