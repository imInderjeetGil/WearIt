import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  User,
  Package,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Heart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/auth-context";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  function handleLogout() {
    logout();
    window.location.href = "/";
  }

  const menuItemClasses =
    "flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-zinc-100";

  return (
    <Menu as="div" className="relative">
      <MenuButton
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1 pr-3 transition hover:border-zinc-400"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <ChevronDown size={16} />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="mt-3 w-64 rounded-2xl border bg-white p-2 shadow-xl focus:outline-none"
      >
        {/* User Info */}
        <div className="border-b p-3">
          <p className="font-semibold">{user?.name}</p>
          <p className="mt-1 text-sm text-zinc-500">{user?.email}</p>
        </div>

        {/* Conditional Menu Items */}
        {!isAdmin && (
          <MenuItem>
            <Link to="/profile" className={menuItemClasses}>
              <User size={18} />
              Profile
            </Link>
          </MenuItem>
        )}

        {isAdmin ? (
          <MenuItem>
            <Link to="/admin-panel" className={menuItemClasses}>
              <LayoutDashboard size={18} />
              Admin Panel
            </Link>
          </MenuItem>
        ) : (
          <MenuItem>
            <Link to="/orders" className={menuItemClasses}>
              <Package size={18} />
              My Orders
            </Link>
          </MenuItem>
        )}

        {!isAdmin && (
          <MenuItem>
            <Link to="/wishlist" className={menuItemClasses}>
              <Heart size={18} />
              Wishlist
            </Link>
          </MenuItem>
        )}

        <hr className="my-2" />

        {/* Logout */}
        <MenuItem>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
