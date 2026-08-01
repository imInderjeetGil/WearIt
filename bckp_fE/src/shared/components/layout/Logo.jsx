import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <Link
      to="/"
      className="select-none"
    >
      <h1
        className="
          text-xl
          font-black
          tracking-[0.35em]
          text-zinc-900
          transition
          hover:opacity-80
        "
      >
        WEARIT
      </h1>
    </Link>
  );
}