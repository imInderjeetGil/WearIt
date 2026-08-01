import { NavLink } from "react-router-dom";

const links = [
  {
    name: "Home",
    to: "/",
  },
  {
    name: "Products",
    to: "/products",
  },
];

export default function DesktopNav() {
  return (
    <nav className="hidden items-center gap-10 lg:flex">

      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) =>
            `
            relative
            text-sm
            font-medium
            transition
            hover:text-black
            ${
              isActive
                ? "text-black"
                : "text-zinc-500"
            }
          `
          }
        >
          {({ isActive }) => (
            <>
              {link.name}

              {isActive && (
                <span className="absolute -bottom-2 left-0 h-2px w-full rounded-full bg-black" />
              )}
            </>
          )}
        </NavLink>
      ))}

    </nav>
  );
}
