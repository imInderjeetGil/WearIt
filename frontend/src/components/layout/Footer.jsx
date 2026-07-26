import { Link } from "react-router-dom";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-200 bg-white">

      <Container>

        <div className="grid gap-12 py-14 md:grid-cols-3">

          {/* Brand */}

          <div>

            <h2 className="text-xl font-black tracking-[0.3em]">
              WEARIT
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-zinc-500">
              Premium clothing crafted for everyday comfort,
              timeless design, and modern streetwear.
            </p>

          </div>

          {/* Navigation */}

          <div>

            <h3 className="mb-5 font-semibold">
              Navigation
            </h3>

            <div className="space-y-3 text-sm">

              <Link
                to="/"
                className="block text-zinc-500 hover:text-black"
              >
                Home
              </Link>

              <Link
                to="/products"
                className="block text-zinc-500 hover:text-black"
              >
                Products
              </Link>

              <Link
                to="/cart"
                className="block text-zinc-500 hover:text-black"
              >
                Cart
              </Link>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="mb-5 font-semibold">
              Contact
            </h3>

            <div className="space-y-3 text-sm text-zinc-500">

              <p>support@wearit.com</p>

              <p>Mon - Sat</p>

              <p>09:00 AM - 06:00 PM</p>

            </div>

          </div>

        </div>

        <div className="border-t border-zinc-200 py-6">

          <p className="text-center text-sm text-zinc-400">

            © {new Date().getFullYear()} WEARIT.
            All rights reserved.

          </p>

        </div>

      </Container>

    </footer>
  );
}