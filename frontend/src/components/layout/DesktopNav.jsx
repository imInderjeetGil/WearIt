import { NavLink, Link } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
  const {
    isAuthenticated,
    user,
    logout,
  } = useAuth();

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
                <span className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-black" />
              )}
            </>
          )}
        </NavLink>
      ))}

    </nav>
  );
}