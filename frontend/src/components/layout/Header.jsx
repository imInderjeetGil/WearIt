import { Menu } from "lucide-react";
import { useState } from "react";

import Container from "./Container";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import CartButton from "./CartButton";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [open, setOpen] = useState(false);

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

            <div className="flex items-center gap-4">

              <button
                onClick={() => setOpen(true)}
                className="lg:hidden"
              >
                <Menu size={24} />
              </button>

              <Logo />

            </div>

            <DesktopNav />

            <div className="flex items-center gap-2">

              <CartButton />

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