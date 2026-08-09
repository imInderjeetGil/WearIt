import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../features/auth/context/auth-context";

import Container from "./Container";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import CartButton from "./CartButton";
import MobileMenu from "./MobileMenu";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <>
      <header
        className="
          sticky
          top-0
          z-40
          border-b
          border-zinc-200/70
          bg-white/90
          backdrop-blur-md
        "
      >
        <Container>

          <div className="flex h-16 items-center justify-between lg:h-20">

            {/* Left */}

            <div className="flex items-center gap-4">

              <button
                onClick={() => setOpen(true)}
                className="lg:hidden"
              >
                <Menu size={24} />
              </button>

              <Logo />

            </div>

            {/* Center */}

            <DesktopNav />

            {/* Right */}

            <div className="flex items-center gap-2">

              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="text-sm font-medium text-zinc-500 transition hover:text-black"
                >
                  Login
                </Link>
              ) : (
                <ProfileMenu />
              )}
              {!isAdmin ? <CartButton /> : null}
            </div>
          </div>

        </Container>

      </header>

      <MobileMenu
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
