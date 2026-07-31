import { Dialog, DialogPanel } from "@headlessui/react";
import { X } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/auth-context";

export default function MobileMenu({
  open,
  onClose,
}) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50 lg:hidden"
    >
      <div className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 flex">
        <DialogPanel className="h-full w-72 bg-white p-6">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              MENU
            </h2>

            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
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
                    to="/admin"
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
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
