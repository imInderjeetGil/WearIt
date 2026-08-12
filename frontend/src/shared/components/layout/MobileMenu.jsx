import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/auth-context";

export default function MobileMenu({
  open,
  onClose,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin-panel");
  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50 lg:hidden"
    >
      <div className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex">
        <DialogPanel className="h-full w-80 max-w-[85vw] bg-white p-6 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-wider">
                MENU
              </h2>

              <button onClick={onClose} className="p-1 text-zinc-600 hover:text-black">
                <X size={24} />
              </button>
            </div>

          <div className="space-y-5">

  {isAdmin ? (

    <>

      <NavLink
        to="/admin-panel"
        onClick={onClose}
        className="block text-lg font-medium"
      >
        Dashboard
      </NavLink>

      <NavLink
        to="/admin-panel/products"
        onClick={onClose}
        className="block text-lg font-medium"
      >
        Products
      </NavLink>

      <NavLink
        to="/admin-panel/categories"
        onClick={onClose}
        className="block text-lg font-medium"
      >
        Categories
      </NavLink>

      <NavLink
        to="/admin-panel/orders"
        onClick={onClose}
        className="block text-lg font-medium"
      >
        Orders
      </NavLink>

      <hr />

      <NavLink
        to="/"
        onClick={onClose}
        className="block text-lg font-medium"
      >
        Back to Store
      </NavLink>

      <button
        onClick={() => {
          logout();
          onClose();
        }}
        className="block text-lg font-medium text-red-500"
      >
        Logout
      </button>

    </>

  ) : (

    <>

      <NavLink
        to="/"
        onClick={onClose}
        className="block text-lg font-medium"
      >
        Home
      </NavLink>

      <NavLink
        to="/products"
        onClick={onClose}
        className="block text-lg font-medium"
      >
        Products
      </NavLink>

      <NavLink
        to="/find-your-look"
        onClick={onClose}
        className="block text-lg font-medium"
      >
        ✨ Find Your Look
      </NavLink>

      {!isAuthenticated ? (
        <>
          <Link
            to="/login"
            onClick={onClose}
            className="block text-lg font-medium"
          >
            Login
          </Link>

          <Link
            to="/register"
            onClick={onClose}
            className="block text-lg font-medium"
          >
            Register
          </Link>
        </>
      ) : (
        <>
          {user?.role === "admin" && (
            <Link
              to="/admin-panel"
              onClick={onClose}
              className="block text-lg font-medium"
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="block text-lg font-medium text-red-500"
          >
            Logout
          </button>
        </>
      )}

    </>

  )}

</div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
