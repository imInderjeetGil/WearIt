import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Shapes,
  ShoppingCart,
  Store,
} from "lucide-react";

const links = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    to: "/admin-panel",
  },
  {
    name: "Products",
    icon: Package,
    to: "/admin-panel/products",
  },
  {
    name: "Categories",
    icon: Shapes,
    to: "/admin-panel/categories",
  },
  {
    name: "Orders",
    icon: ShoppingCart,
    to: "/admin-panel/orders",
  },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-50">

      <div className="grid lg:grid-cols-[260px_1fr]">

        {/* Desktop Sidebar */}

        <aside
          className="
            hidden
            lg:flex
            min-h-screen
            flex-col
            border-r
            bg-white
          "
        >
          <div className="border-b p-6">

            <h1 className="text-2xl font-black">
              WEARIT
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              Admin Panel
            </p>

          </div>

          <nav className="space-y-2 p-4">

            {links.map((link) => {

              const Icon = link.icon;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/admin-panel"}
                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    transition
                    ${
                      isActive
                        ? "bg-black text-white"
                        : "hover:bg-zinc-100"
                    }
                  `
                  }
                >
                  <Icon size={20} />
                  {link.name}
                </NavLink>
              );

            })}

            <div className="my-4 border-t" />

            <NavLink
              to="/"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                transition
                hover:bg-zinc-100
              "
            >
              <Store size={20} />
              Back to Store
            </NavLink>

          </nav>

        </aside>

        {/* Mobile Header / Subnav */}
        <div className="block lg:hidden border-b bg-white p-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/admin-panel"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`
                  }
                >
                  <Icon size={16} />
                  {link.name}
                </NavLink>
              );
            })}
            <NavLink
              to="/"
              className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition"
            >
              <Store size={16} />
              Store
            </NavLink>
          </div>
        </div>

        {/* Dashboard */}

        <main className="p-3 sm:p-4 lg:p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
}