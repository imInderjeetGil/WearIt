import { NavLink, Link } from "react-router-dom";
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
  const { isAuthenticated, user, logout } = useAuth();

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
                <span
                  className="
                    absolute
                    -bottom-2
                    left-0
                    h-[2px]
                    w-full
                    rounded-full
                    bg-black
                  "
                />
              )}
            </>
          )}
        </NavLink>
      ))}

      {!isAuthenticated ? (
        <>
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-500 transition hover:text-black"
          >
            Login
          </Link>

          <Link
  to="/register"
  className="rounded-lg bg-black px-5 py-2 text-sm font-medium !text-white transition hover:bg-zinc-800"
>
  Register
</Link>
        </>
      ) : (
        <>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="text-sm font-medium text-zinc-500 transition hover:text-black"
            >
              Dashboard
            </Link>
          )}

          <span className="text-sm font-semibold">
            Hi, {user?.name || "User"}
          </span>

          <button
            onClick={logout}
            className="rounded-lg bg-red-500 px-5 py-2 text-sm font-medium text-white  hover:bg-red-800"
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}