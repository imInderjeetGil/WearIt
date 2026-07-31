import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  User,
  Package,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/auth-context";

export default function UserMenu() {
  const { user, logout } = useAuth();

function handleLogout() {
    logout();

    window.location.href = "/";
  }
  return (
    <Menu as="div" className="relative">

      <MenuButton
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-zinc-200
          bg-white
          p-1
          pr-3
          transition
          hover:border-zinc-400
        "
      >
        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-black
            text-sm
            font-bold
            text-white
          "
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <ChevronDown size={16} />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        className="
          mt-3
          w-64
          rounded-2xl
          border
          bg-white
          p-2
          shadow-xl
          focus:outline-none
        "
      >
        <div className="border-b p-3">

          <p className="font-semibold">
            {user?.name}
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            {user?.email}
          </p>

        </div>

        <MenuItem>
          <Link
            to="/orders"
            className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-zinc-100"
          >
            <Package size={18} />
            My Orders
          </Link>
        </MenuItem>

        <MenuItem>
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-zinc-100"
          >
            <User size={18} />
            Profile
          </Link>
        </MenuItem>

        <hr className="my-2" />

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
