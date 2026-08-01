export default function SearchBar({
  search,
  setSearch,
}) {
  return (
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search products..."
      className="
        w-full
        rounded-xl
        border
        border-zinc-300
        px-4
        py-3
        outline-none
        transition
        focus:border-black
      "
    />
  );
}