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
    to: "/admin",
  },
  {
    name: "Products",
    icon: Package,
    to: "/admin/products",
  },
  {
    name: "Categories",
    icon: Shapes,
    to: "/admin/categories",
  },
  {
    name: "Orders",
    icon: ShoppingCart,
    to: "/admin/orders",
  },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-zinc-50">

      <div className="grid lg:grid-cols-[260px_1fr]">

        {/* Sidebar */}

        <aside className="border-r bg-white">

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
                  end={link.to === "/admin"}
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

          </nav>

          <div className="absolute bottom-6 left-4 right-4">

            <NavLink
              to="/"
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                px-4
                py-3
                hover:bg-zinc-100
              "
            >
              <Store size={20} />

              Back to Store

            </NavLink>

          </div>

        </aside>

        {/* Content */}

        <main className="p-8">

          <Outlet />

        </main>

      </div>

    </div>
  );
}